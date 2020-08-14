const { Device } = require('./base')

class ShellyVintage extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch', [121, 1101], false, Boolean)

    this._defineProperty('brightness', [111, 5101], 0, Number)

    this._defineProperty('power0', [141, 4101], 0, Number)
    this._defineProperty('energyCounter0', [211, 4103], 0, Number)
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

ShellyVintage.deviceType = 'SHVIN-1'
ShellyVintage.deviceName = 'Shelly Vintage'

module.exports = ShellyVintage
