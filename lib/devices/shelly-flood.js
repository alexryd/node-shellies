const { Device } = require('./base')

class ShellyFlood extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [33, 3101], 0, Number)
    this._defineProperty('flood', [23, 6106], 0, Number)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('battery', [3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellyFlood.deviceType = 'SHWT-1'
ShellyFlood.deviceName = 'Shelly Flood'

module.exports = ShellyFlood
