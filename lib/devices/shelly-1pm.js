const Shelly1 = require('./shelly-1')

class Shelly1PM extends Shelly1 {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('power0', [111, 4101], 0, Number)
    this._defineProperty('energyCounter0', [4103], 0, Number)
    this._defineProperty('overPower', [6102], 0, Number)
    this._defineProperty('overPowerValue', [6109], 0, Number)

    this._defineProperty('deviceTemperature', [113, 3104], 0, Number)
    this._defineProperty('overTemperature', [115, 6101], 0, Number)
  }
}

Shelly1PM.deviceType = 'SHSW-PM'
Shelly1PM.deviceName = 'Shelly 1PM'

module.exports = Shelly1PM
