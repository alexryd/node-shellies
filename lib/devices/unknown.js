const { Device } = require('./base')

/**
 * Represents devices of types that we don't recognize.
 */
class UnknownDevice extends Device {
  constructor(id, host, type) {
    super(id, host)

    this._type = type

    this._defineProperty('payload', -99, null)
  }

  get type() {
    // return the type of the unknown device, rather than the type defined for
    // this class
    return this._type
  }

  _applyCoapUpdate(msg, updates) {
    if (msg.host) {
      this.host = msg.host
    }

    // store the properties as a JSON string
    this.payload = JSON.stringify(updates)
  }
}

UnknownDevice.deviceType = 'UNKNOWN'
UnknownDevice.deviceName = 'Unknown Device'

module.exports = UnknownDevice
