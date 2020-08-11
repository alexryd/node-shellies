const { Switch } = require('./base')

class ShellyHD extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
    this._defineProperty('relay1', 122, false, Boolean)
  }
}

ShellyHD.coapTypeIdentifier = 'SHSW-22'

module.exports = ShellyHD
