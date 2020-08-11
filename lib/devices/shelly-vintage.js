const { Device } = require('./base')

class ShellyVintage extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('brightness', 111, 0, Number)
    this._defineProperty('switch', 121, false, Boolean)
    this._defineProperty('powerMeter0', 141, 0, Number)
    this._defineProperty('energyCounter0', 211, 0, Number)
    this._defineProperty('energyCounter1', 212, 0, Number)
    this._defineProperty('energyCounter2', 213, 0, Number)
    this._defineProperty('energyCounterTotal', 214, 0, Number)
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

ShellyVintage.coapTypeIdentifier = 'SHVIN-1'

module.exports = ShellyVintage
