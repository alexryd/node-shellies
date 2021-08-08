const { Device } = require('./base')

class ShellyDimmer extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch', [121, 1101], false, Boolean)

    this._defineProperty('brightness', [111, 5101], 0, Number)

    this._defineProperty('input0', [131, 2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)
    this._defineProperty('input1', [141, 2201], 0, Number)
    this._defineProperty('inputEvent1', [2202], '', String)
    this._defineProperty('inputEventCounter1', [2203], 0, Number)

    this._defineProperty('power0', [4101], 0, Number)
    this._defineProperty('energyCounter0', [4103], 0, Number)
    this._defineProperty('overPower', [6102], 0, Number)

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

ShellyDimmer.deviceType = 'SHDM-1'
ShellyDimmer.deviceName = 'Shelly Dimmer'

module.exports = ShellyDimmer
