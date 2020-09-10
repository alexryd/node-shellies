const { Device } = require('./base')

class ShellyVintage extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch', [121, 1101], false, Boolean)

    this._defineProperty('brightness', [111, 5101], 0, Number)

    this._defineProperty('power0', [141, 4101], 0, Number)
    this._defineProperty('energyCounter0', [211, 4103], 0, Number)
  }

  /**
   * Sends a request to set the brightness and switch state of this device.
   * @param {number} brightness - A number between 0 and 100.
   * @param {boolean} on - Whether the light should be switched on.
   */
  async setWhite(brightness, on) {
    await this.httpRequest
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
