const Shelly2 = require('./shelly-2')

class Shelly25 extends Shelly2 {
  constructor(id, host, mode = 'relay') {
    super(id, host, mode)

    this._defineProperty('power1', [121, 4201], 0, Number, 'relay')
    this._defineProperty('energyCounter1', [4203], 0, Number, 'relay')

    this._defineProperty('deviceTemperature', [115, 3104], 0, Number)
    this._defineProperty('overTemperature', [117, 6101], 0, Number)
  }
}

Shelly25.deviceType = 'SHSW-25'
Shelly25.deviceName = 'Shelly 2.5'

module.exports = Shelly25
