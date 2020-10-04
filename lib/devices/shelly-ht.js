const { Device } = require('./base')

class ShellyHT extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('temperature')
    this._defineNumberProperty('humidity')

    this._defineBooleanProperty('sensorError')

    this._defineNumberProperty('battery')

    this._defineStringProperty('wakeUpEvent', null, 'unknown')

    this._mapCoapProperties({
      temperature: [33, 3101],
      humidity: [44, 3103],

      sensorError: [3115],

      battery: [77, 3111],

      wakeUpEvent: [9102],
    })
  }
}

ShellyHT.deviceType = 'SHHT-1'
ShellyHT.deviceName = 'Shelly H&T'

module.exports = ShellyHT
