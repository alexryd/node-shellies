const { Device } = require('./base')

class ShellyRGBW extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch', [181, 1101], false, Boolean)

    this._defineProperty('red', [111, 5105], 0, Number)
    this._defineProperty('green', [121, 5106], 0, Number)
    this._defineProperty('blue', [131, 5107], 0, Number)
    this._defineProperty('white', [141, 5108], 0, Number)

    this._defineProperty('gain', [151, 5102], 0, Number)
    this._defineProperty('brightness', [171, 5101], 0, Number)

    this._defineProperty('colorTemperature', [161, 5103], 0, Number)

    this._defineProperty('mode', [9101], 'color', String)
  }

  /**
   * Sends a request to set the color and switch state of the device.
   * @param {Object} opts - The new parameters.
   * @param {number} opts.red - Red brightness.
   * @param {number} opts.green - Green brightness.
   * @param {number} opts.blue - Blue brightness.
   * @param {number} opts.white - White brightness.
   * @param {number} opts.gain - Gain for all channels.
   * @param {boolean} opts.switch - Whether the light should be switched on.
   */
  async setColor(opts) {
    const query = Object.assign({ mode: 'color' }, opts)

    if (Object.prototype.hasOwnProperty.call(query, 'switch')) {
      // rename 'switch' to 'turn'
      query.turn = query.switch ? 'on' : 'off'
      delete query.switch
    }

    await this.httpRequest
      .get(`${this.host}/light/0`)
      .query(query)
  }

  /**
   * Sends a request to set the color temperature, brightness and switch state
   * of this device.
   * @param {number} temperature - A number between 3000 and 6500.
   * @param {number} brightness - A number between 0 and 100.
   * @param {boolean} on - Whether the light should be switched on.
   */
  async setWhite(temperature, brightness, on) {
    await this.httpRequest
      .get(`${this.host}/light/0`)
      .query({
        mode: 'white',
        turn: on ? 'on' : 'off',
        temp: temperature,
        brightness,
      })
  }
}

ShellyRGBW.deviceType = 'SHRGBWW-01'
ShellyRGBW.deviceName = 'Shelly RGBW'

module.exports = ShellyRGBW
