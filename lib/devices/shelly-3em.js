const { Switch } = require('./base')

class Shelly3EM extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', 112, false, Boolean)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('powerFactor0', 114, 0, Number)
    this._defineProperty('current0', 115, 0, Number)
    this._defineProperty('voltage0', 116, 0, Number)

    this._defineProperty('powerMeter1', 121, 0, Number)
    this._defineProperty('powerFactor1', 124, 0, Number)
    this._defineProperty('current1', 125, 0, Number)
    this._defineProperty('voltage1', 126, 0, Number)

    this._defineProperty('powerMeter2', 131, 0, Number)
    this._defineProperty('powerFactor2', 134, 0, Number)
    this._defineProperty('current2', 135, 0, Number)
    this._defineProperty('voltage2', 136, 0, Number)
  }
}

Shelly3EM.coapTypeIdentifier = 'SHEM-3'

module.exports = Shelly3EM
