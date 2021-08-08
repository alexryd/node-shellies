const { Device } = require('./base')

class ShellyDimmerW1 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch', [121, 1101], false, Boolean)

    this._defineProperty('brightness', [111, 5101], 0, Number)

    this._defineProperty('input0', [131, 2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)

    this._defineProperty('loadError', [6104], false, Boolean)

    this._defineProperty('deviceTemperature', [3104], 0, Number)
    this._defineProperty('overTemperature', [6101], 0, Number)

    this._defineProperty('mode', [9101], 'white', String)
  }

  async setWhite(brightness, on) {
    await this.request
      .get(`${this.host}/light/0`)
      .query({
        turn: on ? 'on' : 'off',
        brightness,
      })
  }
}

ShellyDimmerW1.deviceType = 'SHDIMW-1'
ShellyDimmerW1.deviceName = 'Shelly Dimmer W1'

module.exports = ShellyDimmerW1
