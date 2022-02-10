const { Device } = require('./base')

class ShellyTRV extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [3101], 0, Number)
    this._defineProperty('targetTemperature', [3103], 0, Number)
    this._defineProperty('battery', [3111], 0, Number)
    this._defineProperty('sensorError', [3115], false, Boolean)
    this._defineProperty('valveError', [3116], false, Boolean)
    this._defineProperty('mode', [3117], 0, Number)
    this._defineProperty('status', [3118], false, Boolean)
    this._defineProperty('valvePosition', [3121], 0, Number)
  }

  async setTargetTemperature(temperature) {
    await this.request
      .get(`${this.host}/settings`)
      .query({
        target_t: temperature,
      })
  }
}

ShellyTRV.deviceType = 'SHTRV-01'
ShellyTRV.deviceName = 'Shelly TRV'

module.exports = ShellyTRV
