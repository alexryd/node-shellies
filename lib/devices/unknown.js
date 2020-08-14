const { Device } = require('./base')

class UnknownDevice extends Device {
  constructor(id, host, type) {
    super(id, host)

    this._type = type

    this._defineProperty('payload', -99, null)
  }

  get type() {
    return this._type
  }

  _applyUpdate(msg, updates) {
    if (msg.host) {
      this.host = msg.host
    }

    this.payload = JSON.stringify(updates)
  }
}

UnknownDevice.deviceType = 'UNKNOWN'
UnknownDevice.deviceName = 'Unknown Device'

module.exports = UnknownDevice
