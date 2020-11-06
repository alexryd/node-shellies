const { Switch } = require('./base')

class ShellyUni extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', [1101], false, Boolean)
    this._defineProperty('relay1', [1201], false, Boolean)

    this._defineProperty('input0', [2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)
    this._defineProperty('input1', [2201], 0, Number)
    this._defineProperty('inputEvent1', [2202], '', String)
    this._defineProperty('inputEventCounter1', [2203], 0, Number)

    this._defineProperty('externalTemperature0', [3101], null, Number)
    this._defineProperty('externalTemperature1', [3201], null, Number)
    this._defineProperty('externalTemperature2', [3301], null, Number)
    this._defineProperty('externalTemperature3', [3401], null, Number)
    this._defineProperty('externalTemperature4', [3501], null, Number)

    this._defineProperty('voltage0', [3118], 0, Number)

    this._defineProperty('externalHumidity', [3103], null, Number)
  }
}

ShellyUni.deviceType = 'SHUNI-1'
ShellyUni.deviceName = 'Shelly Uni'

module.exports = ShellyUni
