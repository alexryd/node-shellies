const { Device } = require('./base')

class ShellyAir extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('internalTemperature', 113, 0, Number)
    this._defineProperty('overheated', 115, false, Boolean)
    this._defineProperty('input0', 118, 0, Number)
    this._defineProperty('externalTemperature', 119, 0, Number)
    this._defineProperty('totalWorkTime', 121, 0, Number)
    this._defineProperty('energyCounter0', 211, 0, Number)
    this._defineProperty('energyCounter1', 212, 0, Number)
    this._defineProperty('energyCounter2', 213, 0, Number)
    this._defineProperty('energyCounterTotal', 214, 0, Number)
  }
}

ShellyAir.coapTypeIdentifier = 'SHAIR-1'
ShellyAir.modelName = 'Shelly Air'

module.exports = ShellyAir
