const Shelly1 = require('./shelly-1')

class Shelly1L extends Shelly1 {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('input1', [2201], 0, Number)
    this._defineProperty('inputEvent1', [2202], '', String)
    this._defineProperty('inputEventCounter1', [2203], 0, Number)

    this._defineProperty('power0', [4101], 0, Number)
    this._defineProperty('energyCounter0', [4103], 0, Number)

    this._defineProperty('deviceTemperature', [3104], 0, Number)
    this._defineProperty('overTemperature', [6101], false, Boolean)
  }
}

Shelly1L.deviceType = 'SHSW-L'
Shelly1L.deviceName = 'Shelly 1L'

module.exports = Shelly1L
