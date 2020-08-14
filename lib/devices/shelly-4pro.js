const { Switch } = require('./base')

class Shelly4Pro extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('power0', [111], 0, Number)
    this._defineProperty('relay0', [112], false, Boolean)
    this._defineProperty('power1', [121], 0, Number)
    this._defineProperty('relay1', [122], false, Boolean)
    this._defineProperty('power2', [131], 0, Number)
    this._defineProperty('relay2', [132], false, Boolean)
    this._defineProperty('power3', [141], 0, Number)
    this._defineProperty('relay3', [142], false, Boolean)
  }
}

Shelly4Pro.deviceType = 'SHSW-44'
Shelly4Pro.deviceName = 'Shelly 4Pro'

module.exports = Shelly4Pro
