const EventEmitter = require('eventemitter3')

const Coap = require('./lib/coap')
const devices = require('./lib/devices')
const Http = require('./lib/http')
const Mqtt = require('./lib/mqtt')

const deviceKey = (type, id) => `${type}#${id}`

class CoapMessageHandler {
  constructor(lib) {
    this.lib = lib

    Coap.listener.on('update', this.handleMessage, this)
  }

  /**
   * Handles status update messages received over CoAP.
   * @param {Object} msg - The CoAP message.
   */
  handleMessage(msg) {
    // find the correspondning device
    let device = this.lib._devices.get(deviceKey(msg.deviceType, msg.deviceId))

    if (device) {
      // this device is known, so just apply this update
      device.applyCoapUpdate(msg)
    } else {
      // this is an unknown device, create it and announce its discovery
      device = devices.create(msg.deviceType, msg.deviceId, msg.host)
      device.applyCoapUpdate(msg)
      this.lib.emit('discover', device, this.lib.isUnknownDevice(device))
      this.lib.addDevice(device)
    }
  }
}

class MqttMessageHandler {
  constructor(lib) {
    this.lib = lib
    this.deviceKeys = new Map()

    Mqtt.client
      .on('connect', () => {
        // make all online devices announce their presence
        Mqtt.client.requestAnnouncement()
      })
      .on('message', this.handleMessage, this)
  }

  /**
   * Handles messages received over MQTT.
   * @param {array} topic - The message topic (without the 'shellies/' prefix).
   * @param {any} message - The message contents.
   */
  handleMessage(topic, message) {
    if (topic[topic.length - 1] === 'announce') {
      this.handleAnnouncement(message)
      return
    }

    if (topic.length === 1) {
      // skip global messages (other than announcements)
      return
    }

    const mqttId = topic[0]
    if (this.deviceKeys.has(mqttId)) {
      // this is a known device, update it
    } else {
      // this is an unknown device, make it announce itself
    }
  }

  /**
   * Handles announcements from devices.
   * @param {Object} message - The message contents.
   */
  handleAnnouncement(message) {
    const mqttId = message.id
    if (this.deviceKeys.has(mqttId)) {
      // this is a known device, ignore it
      return
    }

    const type = message.model
    const id = this.getDeviceId(message)
    const host = message.ip

    // add this device to our map of MQTT IDs to device keys
    this.deviceKeys.set(mqttId, deviceKey(type, id))

    // create a new device
    const device = devices.create(type, id, host)
    device.mqttId = mqttId
    // request an update
    Mqtt.client.sendCommand('update', device)
    // add the device
    this.lib.emit('discover', device, this.lib.isUnknownDevice(device))
    this.lib.addDevice(device)
  }

  /**
   * Extracts the device's ID from an announcement message.
   * @param {Object} message - The announcement message.
   */
  getDeviceId(message) {
    // try to extract the ID from the MQTT ID
    const m = message.id.match(/^shelly.*-([A-Fa-f0-9]{6,12})/i)
    if (m !== null) {
      return m[1].toUpperCase()
    }

    // If that doesn't work (because the device has a custom MQTT ID) we use the
    // MAC address. This is fine for newer devices that use their MAC address as
    // their ID. Older devices however only use the last 6 digits of the MAC
    // address as their ID. Unfortunately there is no way to know whether this
    // is a newer or older device so we'll always use the full MAC address.
    return message.mac
  }
}

/**
 * Base class for this library that holds a list of all discovered devices.
 */
class Shellies extends EventEmitter {
  constructor() {
    super()

    this._devices = new Map()
    this._coapMessageHandler = new CoapMessageHandler(this)
    this._mqttMessageHandler = new MqttMessageHandler(this)
    this.staleTimeout = 0

    Coap.listener
      .on('start', () => { this.emit('start', 'coap') })
      .on('stop', () => { this.emit('stop', 'coap') })

    Mqtt.client
      .on('connect', () => { this.emit('start', 'mqtt') })
      .on('disconnect', () => { this.emit('stop', 'mqtt') })
  }

  /**
   * The number of devices that has been discovered.
   */
  get size() {
    return this._devices.size
  }

  /**
   * Whether we are listening for device data over CoAP or MQTT.
   */
  get running() {
    return Coap.listener.running || Mqtt.client.connected
  }

  /**
   * Iterates over all discovered devices.
   */
  [Symbol.iterator]() {
    return this._devices.values()
  }

  /**
   * Handles `offline` events from devices.
   */
  _deviceOfflineHandler(device) {
    // skip this if staleTimeout is disabled
    if (!Number.isInteger(this.staleTimeout) || this.staleTimeout <= 0) {
      return
    }

    // set a timer that removes the device after the specified number of
    // milliseconds
    const timeout = setTimeout(() => {
      this.emit('stale', device)
      device.emit('stale', device)
      this.removeDevice(device)
    }, this.staleTimeout)

    // setup a handler that clears the timer if the device comes back online
    const onlineHandler = () => {
      clearTimeout(timeout)
      device.once('offline', this._deviceOfflineHandler, this)
      this.removeListener('remove', removeHandler)
    }
    // setup a handler that clears the timer if the device is removed
    const removeHandler = d => {
      if (d === device) {
        clearTimeout(timeout)
        device.removeListener('online', onlineHandler)
        this.removeListener('remove', removeHandler)
      }
    }
    device.once('online', onlineHandler)
    this.on('remove', removeHandler)
  }

  /**
   * Sets the username and password that will be used when making HTTP requests
   * to all devices. This can be overridden for individual devices by calling
   * setHttpAuthCredentials() on the devices.
   * @param {string} username
   * @param {string} password
   */
  setHttpAuthCredentials(username, password) {
    Http.request.auth(username, password)
  }

  /**
   * Starts listening for CoAP messages to discover and update devices.
   * @param {string} networkInterface - The network interface to listen for
   * updates on. If not specified, all available network interfaces will be
   * used.
   */
  async startCoap(networkInterface = null) {
    await Coap.listener.start(networkInterface)
  }

  /**
   * Starts listening for MQTT messages to discover and update devices.
   * @param {string} url - The URL to connect to.
   * @param {object} options - Connection options. Will be passed to the
   * mqtt.connect() method.
   */
  async startMqtt(url, options = null) {
    await Mqtt.client.connect(url, options)
  }

  /**
   * Stops listening for updates over CoAP and MQTT.
   */
  async stop() {
    Coap.listener.stop()
    await Mqtt.client.disconnect()
  }

  /**
   * Returns the device with the given type and ID.
   * @param {string} type - The device type.
   * @param {string} id - The device ID.
   */
  getDevice(type, id) {
    return this._devices.get(deviceKey(type, id))
  }

  /**
   * Whether the given device is in the list of discovered devices.
   * @param {Object} device - The device to test.
   */
  hasDevice(device) {
    return this._devices.has(deviceKey(device.type, device.id))
  }

  /**
   * Adds a device to the list of discovered devices.
   * @param {Object} device - The device to add.
   */
  addDevice(device) {
    const key = deviceKey(device.type, device.id)

    // make sure this device hasn't already been added
    if (this._devices.has(key)) {
      throw new Error(
        `Device with type ${device.type} and ID ${device.id} already added`
      )
    }

    this._devices.set(key, device)
    if (!device.online) {
      this._deviceOfflineHandler(device)
    } else {
      device.once('offline', this._deviceOfflineHandler, this)
    }
    this.emit('add', device)
  }

  /**
   * Removes a device from the list of discovered devices.
   * @param {Object} device - The device to remove.
   */
  removeDevice(device) {
    if ((this._devices.delete(deviceKey(device.type, device.id)))) {
      device.removeListener('offline', this._deviceOfflineHandler, this)
      this.emit('remove', device)
    }
  }

  /**
   * Removes all discovered devices.
   */
  removeAllDevices() {
    for (const device of this) {
      this.removeDevice(device)
    }
  }

  /**
   * Determines whether the given device is of an unknown type.
   * @param {Object} device - The device to test.
   */
  isUnknownDevice(device) {
    return devices.isUnknown(device)
  }
}

const shellies = new Shellies()

shellies.Coap = Coap
shellies.createDevice = devices.create.bind(devices)
shellies.Http = Http
shellies.Mqtt = Mqtt

module.exports = shellies
