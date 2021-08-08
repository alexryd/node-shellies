const { Switch } = require('./base')

class Shelly3EM extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', [112, 1101], false, Boolean)

    this._defineProperty('power0', [111, 4105], 0, Number)
    this._defineProperty('energyCounter0', [4106], 0, Number)
    this._defineProperty('energyReturned0', [4107], 0, Number)
    this._defineProperty('powerFactor0', [114, 4110], 0, Number)
    this._defineProperty('current0', [115, 4109], 0, Number)
    this._defineProperty('voltage0', [116, 4108], 0, Number)

    this._defineProperty('power1', [121, 4205], 0, Number)
    this._defineProperty('energyCounter1', [4206], 0, Number)
    this._defineProperty('energyReturned1', [4207], 0, Number)
    this._defineProperty('powerFactor1', [124, 4210], 0, Number)
    this._defineProperty('current1', [125, 4209], 0, Number)
    this._defineProperty('voltage1', [126, 4208], 0, Number)

    this._defineProperty('power2', [131, 4305], 0, Number)
    this._defineProperty('energyCounter2', [4306], 0, Number)
    this._defineProperty('energyReturned2', [4307], 0, Number)
    this._defineProperty('powerFactor2', [134, 4310], 0, Number)
    this._defineProperty('current2', [135, 4309], 0, Number)
    this._defineProperty('voltage2', [136, 4308], 0, Number)

    this._defineProperty('overPower', [6102], 0, Number)
  }
}

Shelly3EM.deviceType = 'SHEM-3'
Shelly3EM.deviceName = 'Shelly 3EM'

module.exports = Shelly3EM
