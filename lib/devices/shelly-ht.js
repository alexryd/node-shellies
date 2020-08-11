const { Device } = require('./base')

class ShellyHT extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('temperature', 33, 0, Number)
    this._defineProperty('humidity', 44, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

ShellyHT.coapTypeIdentifier = 'SHHT-1'

module.exports = ShellyHT
