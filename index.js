const EventEmitter = require('eventemitter3')

const Coap = require('./lib/coap')
const Device = require('./lib/device')
const request = require('./lib/http-request')
const StatusUpdatesListener = require('./lib/status-updates-listener')

const deviceKey = (type, id) => `${type}#${id}`

class Shellies extends EventEmitter {
  constructor() {
    super()

    this._devices = new Map()
    this._listener = new StatusUpdatesListener()

    this._listener
      .on('start', () => { this.emit('start') })
      .on('stop', () => { this.emit('stop') })
      .on('statusUpdate', this._statusUpdateHandler, this)

    this._staleTimeout = null
    this.staleTimeout = 8 * 60 * 60 * 1000
  }

  get size() {
    return this._devices.size
  }

  get running() {
    return this._listener.listening
  }

  [Symbol.iterator]() {
    return this._devices.values()
  }

  _statusUpdateHandler(msg) {
    let device = this._devices.get(deviceKey(msg.deviceType, msg.deviceId))

    if (device) {
      device.update(msg)
    } else {
      device = Device.create(msg.deviceType, msg.deviceId, msg.host)

      if (device) {
        device.update(msg)
        this.emit('discover', device)
        this.addDevice(device)
      } else {
        this.emit('unknown', msg.deviceType, msg.deviceId, msg.host)
      }
    }
  }

  _deviceOfflineHandler(device) {
    if (this._staleTimeout !== null) {
      clearTimeout(this._staleTimeout)
    }

    this._staleTimeout = setTimeout(() => {
      this.emit('stale', device)
      device.emit('stale', device)
      this.removeDevice(device)
    }, this.staleTimeout)

    device.on('online', this._deviceOnlineHandler, this)
  }

  _deviceOnlineHandler(device) {
    if (this._staleTimeout !== null) {
      clearTimeout(this._staleTimeout)
      this._staleTimeout = null
    }
  }

  setAuthCredentials(username, password) {
    request.auth(username, password)
  }

  async start() {
    await this._listener.start()
  }

  stop() {
    this._listener.stop()
  }

  getDevice(type, id) {
    return this._devices.get(deviceKey(type, id))
  }

  hasDevice(device) {
    return this._devices.has(deviceKey(device.type, device.id))
  }

  addDevice(device) {
    const key = deviceKey(device.type, device.id)
    if (this._devices.has(key)) {
      throw new Error(
        `Device with type ${device.type} and ID ${device.id} already added`
      )
    }

    this._devices.set(key, device)
    if (!device.online) {
      this._deviceOfflineHandler(device)
    }
    device.on('offline', this._deviceOfflineHandler, this)
    this.emit('add', device)
  }

  removeDevice(device) {
    if ((this._devices.delete(deviceKey(device.type, device.id)))) {
      device.removeListener('offline', this._deviceOfflineHandler, this)
      device.removeListener('online', this._deviceOnlineHandler, this)
      this.emit('remove', device)
    }
  }

  removeAllDevices() {
    for (const device of this) {
      this.removeDevice(device)
    }
  }
}

const shellies = new Shellies()

shellies.Coap = Coap
shellies.createDevice = Device.create.bind(Device)
shellies.request = request
shellies.StatusUpdatesListener = StatusUpdatesListener

module.exports = shellies
