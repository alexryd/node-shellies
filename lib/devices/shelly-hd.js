const { Switch } = require('./base')

class ShellyHD extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
    this._defineProperty('relay1', 122, false, Boolean)
  }
}

ShellyHD.coapTypeIdentifier = 'SHSW-22'

module.exports = ShellyHD
