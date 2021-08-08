const { Switch } = require('./base')

class ShellyEM extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', [112, 1101], false, Boolean)

    this._defineProperty('power0', [111, 4105], 0, Number)
    this._defineProperty('energyCounter0', [4106], 0, Number)
    this._defineProperty('energyReturned0', [4107], 0, Number)
    this._defineProperty('voltage0', [116, 4108], 0, Number)

    this._defineProperty('power1', [121, 4205], 0, Number)
    this._defineProperty('energyCounter1', [4206], 0, Number)
    this._defineProperty('energyReturned1', [4207], 0, Number)
    this._defineProperty('voltage1', [126, 4208], 0, Number)

    this._defineProperty('overPower', [6102], 0, Number)
  }
}

ShellyEM.deviceType = 'SHEM'
ShellyEM.deviceName = 'Shelly EM'

module.exports = ShellyEM
