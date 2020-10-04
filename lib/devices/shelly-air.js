const { Switch } = require('./base')

class ShellyAir extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('relay0')

    this._defineNumberProperty('totalWorkTime')

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')
    this._defineBooleanProperty('overPower')
    this._defineNumberProperty('overPowerValue')

    this._defineNumberProperty('deviceTemperature')
    this._defineBooleanProperty('overTemperature')

    this._defineNumberProperty('externalTemperature0', null, null)
    this._defineNumberProperty('externalTemperature1', null, null)
    this._defineNumberProperty('externalTemperature2', null, null)
    this._defineNumberProperty('externalHumidity', null, null)

    this._mapCoapProperties({
      relay0: [112, 1101],

      totalWorkTime: [121, 1104],

      input0: [118, 2101],
      inputEvent0: [2102],
      inputEventCounter0: [2103],

      power0: [111, 4101],
      energyCounter0: [211, 4103],
      overPower: [6102],
      overPowerValue: [6109],

      deviceTemperature: [113, 3104],
      overTemperature: [115, 6101],

      externalTemperature0: [119, 3101],
      externalTemperature1: [3201],
      externalTemperature2: [3301],
      externalHumidity: [3103],
    })
  }
}

ShellyAir.deviceType = 'SHAIR-1'
ShellyAir.deviceName = 'Shelly Air'

module.exports = ShellyAir
