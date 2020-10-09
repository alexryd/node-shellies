const ShellyPlug = require('./shelly-plug')

class ShellyPlugS extends ShellyPlug {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('deviceTemperature')
    this._defineBooleanProperty('overTemperature')

    this._mapCoapProperties({
      deviceTemperature: [113, 3104],
      overTemperature: [115, 6101],
    })

    this._mapMqttTopics({
      deviceTemperature: 'temperature',
      overTemperature: 'overtemperature',
    })
  }
}

ShellyPlugS.deviceType = 'SHPLG-S'
ShellyPlugS.deviceName = 'Shelly Plug S'

module.exports = ShellyPlugS
