const Shelly1 = require('./shelly-1')

class Shelly1PM extends Shelly1 {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')
    this._defineBooleanProperty('overPower')
    this._defineNumberProperty('overPowerValue')

    this._defineNumberProperty('deviceTemperature')
    this._defineBooleanProperty('overTemperature')

    this._mapCoapProperties({
      power0: [111, 4101],
      energyCounter0: [4103],
      overPower: [6102],
      overPowerValue: [6109],

      deviceTemperature: [113, 3104],
      overTemperature: [115, 6101],
    })

    this._mapMqttTopics({
      power0: 'relay/0/power',
      energyCounter0: 'relay/0/energy',
      overPowerValue: 'relay/0/overpower_value',

      deviceTemperature: 'temperature',
      overTemperature: 'overtemperature',
    })
  }
}

Shelly1PM.deviceType = 'SHSW-PM'
Shelly1PM.deviceName = 'Shelly 1PM'

module.exports = Shelly1PM
