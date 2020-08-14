const { Device } = require('./base')

class ShellyBulb extends Device {
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

  async setColor(opts) {
    const query = Object.assign({ mode: 'color' }, opts)
    if (Object.prototype.hasOwnProperty.call(query, 'switch')) {
      query.turn = query.switch ? 'on' : 'off'
      delete query.switch
    }

    await this.request
      .get(`${this.host}/light/0`)
      .query(query)
  }

  async setWhite(temperature, brightness, on) {
    await this.request
      .get(`${this.host}/light/0`)
      .query({
        mode: 'white',
        turn: on ? 'on' : 'off',
        temp: temperature,
        brightness,
      })
  }
}

ShellyBulb.deviceType = 'SHBLB-1'
ShellyBulb.deviceName = 'Shelly Bulb'

module.exports = ShellyBulb
