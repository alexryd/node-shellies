const { Switch } = require('./base')

class ShellyEM extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
  }
}

ShellyEM.coapTypeIdentifier = 'SHEM'
ShellyEM.modelName = 'Shelly EM'

module.exports = ShellyEM
