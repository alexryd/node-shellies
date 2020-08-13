const Shelly2 = require('./shelly2')

class Shelly25 extends Shelly2 {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('internalTemperature', 115, 0, Number)
    this._defineProperty('overheated', 117, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
  }
}

Shelly25.coapTypeIdentifier = 'SHSW-25'
Shelly25.modelName = 'Shelly 2.5'

module.exports = Shelly25
