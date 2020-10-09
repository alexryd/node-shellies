const { Device } = require('./base')

class ShellyDoorWindow extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('state')
    this._defineNumberProperty('tilt')
    this._defineBooleanProperty('vibration')
    this._defineNumberProperty('illuminance')
    this._defineStringProperty('illuminanceLevel', null, 'unknown')

    this._defineBooleanProperty('sensorError')

    this._defineNumberProperty('battery')

    this._defineStringProperty('wakeUpEvent', null, 'unknown')

    this._mapCoapProperties({
      state: [55, 3108],
      tilt: [3109],
      vibration: [6110],
      illuminance: [66, 3106],
      illuminanceLevel: [3110],

      sensorError: [3115],

      battery: [77, 3111],

      wakeUpEvent: [9102],
    })

    this._mapMqttTopics({
      state: 'sensor/state',
      tilt: 'sensor/tilt',
      vibration: 'sensor/vibration',
      illuminance: 'sensor/lux',

      battery: 'sensor/battery',
    })
  }
}

ShellyDoorWindow.deviceType = 'SHDW-1'
ShellyDoorWindow.deviceName = 'Shelly Door/Window'

module.exports = ShellyDoorWindow
