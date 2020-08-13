const { Switch } = require('./base')

class Shelly4Pro extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
    this._defineProperty('relay1', 122, false, Boolean)
    this._defineProperty('powerMeter2', 131, 0, Number)
    this._defineProperty('relay2', 132, false, Boolean)
    this._defineProperty('powerMeter3', 141, 0, Number)
    this._defineProperty('relay3', 142, false, Boolean)
  }
}

Shelly4Pro.coapTypeIdentifier = 'SHSW-44'
Shelly4Pro.modelName = 'Shelly 4Pro'

module.exports = Shelly4Pro
