const { Switch } = require('./base')

class ShellyEM extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('relay0')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')
    this._defineNumberProperty('energyReturned0')
    this._defineNumberProperty('voltage0')

    this._defineNumberProperty('power1')
    this._defineNumberProperty('energyCounter1')
    this._defineNumberProperty('energyReturned1')
    this._defineNumberProperty('voltage1')

    this._defineBooleanProperty('overPower')

    this._mapCoapProperties({
      relay0: [112, 1101],

      power0: [111, 4105],
      energyCounter0: [4106],
      energyReturned0: [4107],
      voltage0: [116, 4108],

      power1: [121, 4205],
      energyCounter1: [4206],
      energyReturned1: [4207],
      voltage1: [126, 4208],

      overPower: [6102],
    })
  }
}

ShellyEM.deviceType = 'SHEM'
ShellyEM.deviceName = 'Shelly EM'

module.exports = ShellyEM
