const { Device } = require('./base')

class ShellyDuo extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('brightness', 111, 0, Number)
    this._defineProperty('switch', 121, false, Boolean)
    this._defineProperty('colorTemperature', 131, 0, Number)
    this._defineProperty('powerMeter0', 141, 0, Number)
    this._defineProperty('energyCounter0', 211, 0, Number)
    this._defineProperty('energyCounter1', 212, 0, Number)
    this._defineProperty('energyCounter2', 213, 0, Number)
    this._defineProperty('energyCounterTotal', 214, 0, Number)
  }

  async setWhite(temperature, brightness, on) {
    const white = (temperature - 2700) / (6500 - 2700) * 100

    await this.request
      .get(`${this.host}/light/0`)
      .query({
        turn: on ? 'on' : 'off',
        temp: temperature,
        white: Math.max(Math.min(Math.round(white), 100), 0),
        brightness,
      })
  }
}

ShellyDuo.coapTypeIdentifier = 'SHBDUO-1'

module.exports = ShellyDuo
