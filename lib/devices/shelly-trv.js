const { Device } = require('./base')

class ShellyTRV extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [3101], 0, Number)
    this._defineProperty('targetTemp', [3103], 0, Number)
    this._defineProperty('battery', [3111], 0, Number)
    this._defineProperty('sensorError', [3115], 0, Number)
    this._defineProperty('valveError', [3116], 0, Number)
    this._defineProperty('status', [3118], 0, Boolean)
  }
}

ShellyMotion.deviceType = 'SHTRV-01'
ShellyMotion.deviceName = 'Shelly TRV'

module.exports = ShellyTRV
