const Shelly2 = require('./shelly-2')

class Shelly25 extends Shelly2 {
  constructor(id, host, mode = 'relay') {
    super(id, host, mode)

    this._defineNumberProperty('power1', 'relay')
    this._defineNumberProperty('energyCounter1', 'relay')

    this._defineNumberProperty('deviceTemperature')
    this._defineBooleanProperty('overTemperature')

    this._mapCoapProperties({
      power1: [121, 4201],
      energyCounter1: [4203],

      deviceTemperature: [115, 3104],
      overTemperature: [117, 6101],
    })

    this._mapMqttTopics({
      power0: 'relay/0/power',
      energyCounter0: 'relay/0/energy',
      power1: 'relay/1/power',
      energyCounter1: 'relay/1/energy',

      deviceTemperature: 'temperature',
      overTemperature: 'overtemperature',
    })
  }
}

Shelly25.deviceType = 'SHSW-25'
Shelly25.deviceName = 'Shelly 2.5'

module.exports = Shelly25
