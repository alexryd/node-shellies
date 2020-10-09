const { Device } = require('./base')

class ShellyFlood extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('temperature')
    this._defineBooleanProperty('flood')

    this._defineBooleanProperty('sensorError')

    this._defineNumberProperty('battery')

    this._defineStringProperty('wakeUpEvent', null, 'unknown')

    this._mapCoapProperties({
      temperature: [33, 3101],
      flood: [23, 6106],

      sensorError: [3115],

      battery: [3111],

      wakeUpEvent: [9102],
    })

    this._mapMqttTopics({
      temperature: 'sensor/temperature',
      flood: 'sensor/flood',

      battery: 'sensor/battery',
    })
  }
}

ShellyFlood.deviceType = 'SHWT-1'
ShellyFlood.deviceName = 'Shelly Flood'

module.exports = ShellyFlood
