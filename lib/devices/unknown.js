const { Device } = require('./base')

class UnknownDevice extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('payload', -99, null)
  }

  _applyUpdate(msg, updates) {
    if (msg.host) {
      this.host = msg.host
    }

    this.payload = JSON.stringify(updates)
  }
}

module.exports = UnknownDevice
