const { Switch } = require('./base')

class ShellyPlug extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('relay0')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')

    this._defineBooleanProperty('overPower')
    this._defineNumberProperty('overPowerValue')

    this._mapCoapProperties({
      relay0: [112, 1101],

      power0: [111, 4101],
      energyCounter0: [4103],

      overPower: [6102],
      overPowerValue: [6109],
    })

    this._mapMqttTopics({
      relay0: 'relay/0',

      power0: 'relay/0/power',
      energyCounter0: 'relay/0/energy',

      overPowerValue: 'relay/0/overpower_value',
    })
  }
}

ShellyPlug.deviceType = 'SHPLG-1'
ShellyPlug.deviceName = 'Shelly Plug'

module.exports = ShellyPlug
