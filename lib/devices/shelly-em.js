const { Switch } = require('./base')

class ShellyEM extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
  }
}

ShellyEM.coapTypeIdentifier = 'SHEM'

module.exports = ShellyEM
