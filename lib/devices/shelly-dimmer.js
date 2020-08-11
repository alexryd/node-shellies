const { Device } = require('./base')

class ShellyDimmer extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('brightness', 111, 0, Number)
    this._defineProperty('switch', 121, false, Boolean)
    this._defineProperty('input0', 131, 0, Number)
    this._defineProperty('input1', 141, 0, Number)
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

ShellyDimmer.coapTypeIdentifier = 'SHDM-1'

module.exports = ShellyDimmer
