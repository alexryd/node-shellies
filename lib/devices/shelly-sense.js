const { Device } = require('./base')

class ShellySense extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('motion', 11, false, Boolean)
    this._defineProperty('charging', 22, false, Boolean)
    this._defineProperty('temperature', 33, 0, Number)
    this._defineProperty('humidity', 44, 0, Number)
    this._defineProperty('illuminance', 66, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

ShellySense.coapTypeIdentifier = 'SHSEN-1'

module.exports = ShellySense
