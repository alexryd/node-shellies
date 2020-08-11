const { Device } = require('./base')

class ShellyFlood extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('flood', 23, false, Boolean)
    this._defineProperty('temperature', 33, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

ShellyFlood.coapTypeIdentifier = 'SHWT-1'

module.exports = ShellyFlood
