const { Device } = require('./base')

class ShellyDuo extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch', [121, 1101], false, Boolean)

    this._defineProperty('brightness', [111, 5101], 0, Number)
    this._defineProperty('colorTemperature', [131, 5103], 0, Number)
    this._defineProperty('whiteLevel', [5104], 0, Number)

    this._defineProperty('power0', [141, 4101], 0, Number)
    this._defineProperty('energyCounter0', [211, 4103], 0, Number)
  }

  /**
   * Sends a request to set the color temperature, brightness and switch state
   * of this device.
   * @param {number} temperature - A number between 3000 and 6500.
   * @param {number} brightness - A number between 0 and 100.
   * @param {boolean} on - Whether the light should be switched on.
   */
  async setWhite(temperature, brightness, on) {
    // calculate the white level based on the temperature
    const white = (temperature - 2700) / (6500 - 2700) * 100

    await this.httpRequest
      .get(`${this.host}/light/0`)
      .query({
        turn: on ? 'on' : 'off',
        temp: temperature,
        white: Math.max(Math.min(Math.round(white), 100), 0),
        brightness,
      })
  }
}

ShellyDuo.deviceType = 'SHBDUO-1'
ShellyDuo.deviceName = 'Shelly Duo'

module.exports = ShellyDuo
