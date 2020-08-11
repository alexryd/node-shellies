const { Switch } = require('./base')

class ShellyPlug extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
  }
}

ShellyPlug.coapTypeIdentifier = 'SHPLG-1'

module.exports = ShellyPlug
