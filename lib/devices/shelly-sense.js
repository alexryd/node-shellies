const { Device } = require('./base')

class ShellySense extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [33, 3101], 0, Number)
    this._defineProperty('humidity', [44, 3103], 0, Number)
    this._defineProperty('motion', [11, 6107], 0, Number)
    this._defineProperty('illuminance', [66, 3106], 0, Number)

    this._defineProperty('charging', [22, 3112], 0, Number)
    this._defineProperty('battery', [77, 3111], 0, Number)
  }
}

ShellySense.deviceType = 'SHSEN-1'
ShellySense.deviceName = 'Shelly Sense'

module.exports = ShellySense
