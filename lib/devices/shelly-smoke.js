const { Device } = require('./base')

class ShellySmoke extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('temperature')
    this._defineBooleanProperty('smoke')

    this._defineBooleanProperty('sensorError')

    this._defineNumberProperty('battery')

    this._defineStringProperty('wakeUpEvent', null, 'unknown')

    this._mapCoapProperties({
      temperature: [3101],
      smoke: [6105],

      sensorError: [3115],

      battery: [77, 3111],

      wakeUpEvent: [9102],
    })

    this._mapMqttTopics({
      temperature: 'sensor/temperature',
      smoke: 'sensor/smoke',

      battery: 'sensor/battery',
    })
  }
}

ShellySmoke.deviceType = 'SHSM-01'
ShellySmoke.deviceName = 'Shelly Smoke'

module.exports = ShellySmoke
