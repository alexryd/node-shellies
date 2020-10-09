const { Switch } = require('./base')

class Shelly3EM extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('relay0')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')
    this._defineNumberProperty('energyReturned0')
    this._defineNumberProperty('powerFactor0')
    this._defineNumberProperty('current0')
    this._defineNumberProperty('voltage0')

    this._defineNumberProperty('power1')
    this._defineNumberProperty('energyCounter1')
    this._defineNumberProperty('energyReturned1')
    this._defineNumberProperty('powerFactor1')
    this._defineNumberProperty('current1')
    this._defineNumberProperty('voltage1')

    this._defineNumberProperty('power2')
    this._defineNumberProperty('energyCounter2')
    this._defineNumberProperty('energyReturned2')
    this._defineNumberProperty('powerFactor2')
    this._defineNumberProperty('current2')
    this._defineNumberProperty('voltage2')

    this._defineBooleanProperty('overPower')

    this._mapCoapProperties({
      relay0: [112, 1101],

      power0: [111, 4105],
      energyCounter0: [4106],
      energyReturned0: [4107],
      powerFactor0: [114, 4110],
      current0: [115, 4109],
      voltage0: [116, 4108],

      power1: [121, 4205],
      energyCounter1: [4206],
      energyReturned1: [4207],
      powerFactor1: [124, 4210],
      current1: [125, 4209],
      voltage1: [126, 4208],

      power2: [131, 4305],
      energyCounter2: [4306],
      energyReturned2: [4307],
      powerFactor2: [134, 4310],
      current2: [135, 4309],
      voltage2: [136, 4308],

      overPower: [6102],
    })

    this._mapMqttTopics({
      relay0: 'relay/0',

      power0: 'emeter/0/power',
      energyCounter0: 'emeter/0/energy',
      energyReturned0: 'emeter/0/returned_energy',
      powerFactor0: 'emeter/0/pf',
      current0: 'emeter/0/current',
      voltage0: 'emeter/0/voltage',

      power1: 'emeter/1/power',
      energyCounter1: 'emeter/1/energy',
      energyReturned1: 'emeter/1/returned_energy',
      powerFactor1: 'emeter/1/pf',
      current1: 'emeter/1/current',
      voltage1: 'emeter/1/voltage',

      power2: 'emeter/2/power',
      energyCounter2: 'emeter/2/energy',
      energyReturned2: 'emeter/2/returned_energy',
      powerFactor2: 'emeter/2/pf',
      current2: 'emeter/2/current',
      voltage2: 'emeter/2/voltage',
    })
  }
}

Shelly3EM.deviceType = 'SHEM-3'
Shelly3EM.deviceName = 'Shelly 3EM'

module.exports = Shelly3EM
