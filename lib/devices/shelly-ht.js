const { Device } = require('./base')

class ShellyHT extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', 33, 0, Number)
    this._defineProperty('humidity', 44, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

ShellyHT.coapTypeIdentifier = 'SHHT-1'
ShellyHT.modelName = 'Shelly H&T'

module.exports = ShellyHT
