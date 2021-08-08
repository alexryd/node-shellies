const { Device } = require('./base')

class ShellySmoke extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [3101], 0, Number)
    this._defineProperty('smoke', [6105], 0, Number)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('battery', [77, 3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellySmoke.deviceType = 'SHSM-01'
ShellySmoke.deviceName = 'Shelly Smoke'

module.exports = ShellySmoke
