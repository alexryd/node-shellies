const { Switch } = require('./base')

class ShellyAir extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', [112, 1101], false, Boolean)

    this._defineProperty('totalWorkTime', [121, 1104], 0, Number)

    this._defineProperty('input0', [118, 2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)

    this._defineProperty('power0', [111, 4101], 0, Number)
    this._defineProperty('energyCounter0', [211, 4103], 0, Number)
    this._defineProperty('overPower', [6102], 0, Number)
    this._defineProperty('overPowerValue', [6109], 0, Number)

    this._defineProperty('deviceTemperature', [113, 3104], 0, Number)
    this._defineProperty('overTemperature', [115, 6101], 0, Number)

    this._defineProperty('externalTemperature0', [119, 3101], null, Number)
    this._defineProperty('externalTemperature1', [3201], null, Number)
    this._defineProperty('externalTemperature2', [3301], null, Number)
    this._defineProperty('externalHumidity', [3103], null, Number)
  }
}

ShellyAir.deviceType = 'SHAIR-1'
ShellyAir.deviceName = 'Shelly Air'

module.exports = ShellyAir
