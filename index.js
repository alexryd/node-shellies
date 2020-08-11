const EventEmitter = require('eventemitter3')

const Coap = require('./lib/coap')
const devices = require('./lib/devices')
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

    this.staleTimeout = 0
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
      device = devices.create(msg.deviceType, msg.deviceId, msg.host)
      device.update(msg)
      this.emit('discover', device, this.isUnknownDevice(device))
      this.addDevice(device)
    }
  }

  _deviceOfflineHandler(device) {
    if (!Number.isInteger(this.staleTimeout) || this.staleTimeout <= 0) {
      return
    }

    const timeout = setTimeout(() => {
      this.emit('stale', device)
      device.emit('stale', device)
      this.removeDevice(device)
    }, this.staleTimeout)

    const onlineHandler = () => {
      clearTimeout(timeout)
      device.once('offline', this._deviceOfflineHandler, this)
      this.removeListener('remove', removeHandler)
    }
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

  setAuthCredentials(username, password) {
    request.auth(username, password)
  }

  async start(networkInterface = null) {
    await this._listener.start(networkInterface)
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
    } else {
      device.once('offline', this._deviceOfflineHandler, this)
    }
    this.emit('add', device)
  }

  removeDevice(device) {
    if ((this._devices.delete(deviceKey(device.type, device.id)))) {
      device.removeListener('offline', this._deviceOfflineHandler, this)
      this.emit('remove', device)
    }
  }

  removeAllDevices() {
    for (const device of this) {
      this.removeDevice(device)
    }
  }

  isUnknownDevice(device) {
    return devices.isUnknown(device)
  }
}

const shellies = new Shellies()

shellies.Coap = Coap
shellies.createDevice = devices.create.bind(devices)
shellies.request = request
shellies.StatusUpdatesListener = StatusUpdatesListener

module.exports = shellies
