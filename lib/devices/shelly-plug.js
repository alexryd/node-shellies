const { Switch } = require('./base')

class ShellyPlug extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
  }
}

ShellyPlug.coapTypeIdentifier = 'SHPLG-1'
ShellyPlug.modelName = 'Shelly Plug'

module.exports = ShellyPlug
