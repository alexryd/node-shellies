const { Switch } = require('./base')

class Shelly1PM extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('internalTemperature', 113, 0, Number)
    this._defineProperty('overheated', 115, false, Boolean)
    this._defineProperty('input0', 118, 0, Number)
  }

  _applyUpdate(msg, updates) {
    // if property 119 is part of the updates, we set the externalTemperature
    // property
    const r = updates.reduce((a, t) => {
      return a + (t[1] === 119 ? 1 : 0)
    }, 0)
    if (r >= 1 &&
      !Object.prototype.hasOwnProperty.call(this, 'externalTemperature')) {
      this._defineProperty('externalTemperature', 119, 0, Number)
    }

    super._applyUpdate(msg, updates)
  }
}

Shelly1PM.coapTypeIdentifier = 'SHSW-PM'

module.exports = Shelly1PM
