const { Device } = require('./base')

class ShellyTRV extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temp', [3101], 0, Number)
    this._defineProperty('targetTemp', [3103], 0, Number)
    this._defineProperty('battery', [3111], 0, Number)
    this._defineProperty('sensorError', [3115], 0, Number)
    this._defineProperty('valveError', [3116], 0, Number)
    this._defineProperty('mode', [3117], 0, Number)
    this._defineProperty('status', [3118], 0, Boolean)
    this._defineProperty('valvePos', [3118], 0, Number)
  }
}

ShellyTRV.deviceType = 'SHTRV-01'
ShellyTRV.deviceName = 'Shelly TRV'

module.exports = ShellyTRV
