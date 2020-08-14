const { Device } = require('./base')

class ShellyHT extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [33, 3101], 0, Number)
    this._defineProperty('humidity', [44, 3103], 0, Number)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('battery', [77, 3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellyHT.deviceType = 'SHHT-1'
ShellyHT.deviceName = 'Shelly H&T'

module.exports = ShellyHT
