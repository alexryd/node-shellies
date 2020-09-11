const EventEmitter = require('eventemitter3')
const mqtt = require('mqtt')

class Client extends EventEmitter {
  constructor() {
    super()

    this._client = null
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
      .once('close', () => {
        this._client = null
        this.emit('disconnect')
      })
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

    if (t[t.length - 1] === 'command') {
      // ignore commands
      return
    }

    let m = message

    try {
      m = JSON.parse(message)
    } catch (e) {
      // the message is not valid JSON, just emit it as it is
    }

    this.emit('message', t, m)
  }
}

module.exports = {
  Client,
  client: new Client(),
}
