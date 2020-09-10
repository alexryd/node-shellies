const EventEmitter = require('eventemitter3')

const Coap = require('./lib/coap')
const devices = require('./lib/devices')
const Http = require('./lib/http')

const deviceKey = (type, id) => `${type}#${id}`

/**
 * Base class for this library that holds a list of all discovered devices and
 * handles directing updates received over CoAP to the right device.
 */
class Shellies extends EventEmitter {
  constructor() {
    super()

    this._devices = new Map()
    this._coapListener = new Coap.Listener()

    this._coapListener
      .on('start', () => { this.emit('start') })
      .on('stop', () => { this.emit('stop') })
      .on('update', this._coapUpdateHandler, this)

    this.staleTimeout = 0
  }

  /**
   * The number of devices that has been discovered.
   */
  get size() {
    return this._devices.size
  }

  /**
   * Whether we are listening for device data over CoAP.
   */
  get running() {
    return this._coapListener.running
  }

  /**
   * Iterates over all discovered devices.
   */
  [Symbol.iterator]() {
    return this._devices.values()
  }

  /**
   * Handles status update messages received over CoAP.
   * @param {Object} msg - The CoAP message.
   */
  _coapUpdateHandler(msg) {
    // find the correspondning device
    let device = this._devices.get(deviceKey(msg.deviceType, msg.deviceId))

    if (device) {
      // this device is known, so just apply this update
      device.applyCoapUpdate(msg)
    } else {
      // this is an unknown device, create it and announce its discovery
      device = devices.create(msg.deviceType, msg.deviceId, msg.host)
      device.applyCoapUpdate(msg)
      this.emit('discover', device, this.isUnknownDevice(device))
      this.addDevice(device)
    }
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
    await this._coapListener.start(networkInterface)
  }

  /**
   * Stops listening for updates over CoAP.
   */
  stop() {
    this._coapListener.stop()
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

module.exports = shellies
