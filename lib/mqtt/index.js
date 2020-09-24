const EventEmitter = require('eventemitter3')
const mqtt = require('mqtt')

const MqttDevice = require('./device')
const MqttUpdate = require('./update')

class Client extends EventEmitter {
  constructor() {
    super()

    this._client = null
    this._devices = new Map()
    this._updates = new Map()

    this.updatesPoolingTime = 500
  }

  /**
   * Whether this client is connected.
   */
  get connected() {
    return this._client !== null && this._client.connected
  }

  /**
   * Connects to the MQTT broker at the given URL and starts listening for
   * messages from Shelly devices.
   * @param {string} url - The URL to connect to.
   * @param {object} options - Connection options. Will be passed to the
   * mqtt.connect() method.
   */
  async connect(url, options = null) {
    if (this._client !== null) {
      return
    }

    // connect to the broker
    await this._connect(url, options)

    // setup event handlers
    this._client
      .once('close', this._closeHandler.bind(this))
      .on('message', this._messageHandler.bind(this))

    // subscribe to all relevant topics
    await this._subscribe()

    this.emit('connect')
  }

  /**
   * Connects to the MQTT broker at the given URL.
   */
  _connect(url, options = null) {
    return new Promise((resolve, reject) => {
      this._client = mqtt.connect(url, options)

      this._client
        .once('connect', () => {
          resolve()
        })
        .once('error', err => {
          this._client = null
          reject(err)
        })
    })
  }

  /**
   * Subscribes to all relevant MQTT topics.
   */
  _subscribe() {
    return new Promise((resolve, reject) => {
      this._client.subscribe('shellies/#', err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * Disconnects this client from the MQTT broker.
   */
  disconnect(force = false) {
    if (this._client === null) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this._client.end(force, () => {
        resolve()
      })
    })
  }

  /**
   * Sends a command to all devices or a single device.
   * @param {string} command - The command to send.
   * @param {object} device - The device to send the command to, or null to send
   * the command to all devices.
   */
  sendCommand(command, device = null) {
    const topic = ['shellies', 'command']
    if (device) {
      // if a device is given, add its ID to the topic
      topic.splice(1, 0, device.mqttId)
    }

    return new Promise((resolve, reject) => {
      this._client.publish(topic.join('/'), command, err => {
        if (!err) {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  }

  /**
   * Request an announcement from a device, or from all devices.
   * @param {object} device - The device to request an announcement from, or
   * null to request announcements from all connected devices.
   */
  requestAnnouncement(device = null) {
    return this.sendCommand('announce', device)
  }

  /**
   * Request an update from a device, or from all devices.
   * @param {object} device - The device to request an update from, or null to
   * request updates from all connected devices.
   */
  requestUpdate(device = null) {
    return this.sendCommand('update', device)
  }

  /**
   * Handles closed connections.
   */
  _closeHandler() {
    this._client = null
    this._devices = new Map()

    // cancel all updates
    for (const u of this._updates.values()) {
      u.cancel()
    }
    this._updates = new Map()

    this.emit('disconnect')
  }

  /**
   * Handles MQTT messages.
   */
  _messageHandler(topic, message) {
    const t = topic.split('/')
    if (t[0] !== 'shellies' || t.length < 2) {
      // this should never happen
      return
    }

    // remove the 'shellies' part
    t.shift()

    let m = message

    try {
      m = JSON.parse(message)
    } catch (e) {
      // the message is not valid JSON, just use it as it is
    }

    this.emit('message', t, m)

    if (t[t.length - 1] === 'announce') {
      this._handleAnnouncement(m)
    } else if (t.length > 1 && t[t.length - 1] !== 'command') {
      // treat all messages that are not global (e.g. not related to a specific
      // device) and are not commands nor announcements as device updates
      this._handleUpdate(t, m)
    }
  }

  /**
   * Handles device announcements.
   * @param {Object} message - The message contents.
   */
  _handleAnnouncement(message) {
    const mqttId = message.id
    let device = null

    if (!this._devices.has(mqttId)) {
      // this is a new device, add it
      device = new MqttDevice(message)
      this._devices.set(mqttId, device)
      // and request and update of the device's properties
      this.requestUpdate(device)
    } else {
      // this is a known device, update it
      device = this._devices.get(mqttId)
      device.update(message)
    }

    this._getStoredUpdate(mqttId).device = device
  }

  /**
   * Handles updates to device properties.
   * @param {string[]} topic - The MQTT topic.
   * @param {any} message - The update contents.
   */
  _handleUpdate(topic, message) {
    const mqttId = topic[0]
    const update = this._getStoredUpdate(mqttId)

    update.set(
      topic.slice(1).join('/'),
      message
    )
  }

  /**
   * Retrieves the corresponding update for the given MQTT ID. If an update
   * doesn't already exist, one will be created.
   * @param {string} mqttId - The device MQTT ID.
   */
  _getStoredUpdate(mqttId) {
    let update = this._updates.get(mqttId)

    if (!update) {
      // create a new update
      update = new MqttUpdate(
        this._handleExpiredUpdate.bind(this),
        this.updatesPoolingTime,
        this._devices.get(mqttId)
      )

      this._updates.set(mqttId, update)
    }

    return update
  }

  /**
   * Handles expired updates.
   * @param {object} update - The update.
   */
  _handleExpiredUpdate(update) {
    this._updates.delete(update)
    this.emit('update', update)
  }
}

module.exports = {
  Client,
  client: new Client(),
}
