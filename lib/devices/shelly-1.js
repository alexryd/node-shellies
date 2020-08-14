const { Switch } = require('./base')

class Shelly1 extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', [112, 1101], false, Boolean)

    this._defineProperty('input0', [118, 2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)

    this._defineProperty('externalTemperature0', [119, 3101], null, Number)
    this._defineProperty('externalTemperature1', [3201], null, Number)
    this._defineProperty('externalTemperature2', [3301], null, Number)

    this._defineProperty('externalHumidity', [3103], null, Number)

    this._defineProperty('externalInput0', [3117], null, Number)
  }
}

Shelly1.deviceType = 'SHSW-1'
Shelly1.deviceName = 'Shelly 1'

module.exports = Shelly1
