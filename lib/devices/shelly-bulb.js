const { Device } = require('./base')

class ShellyBulb extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('red', 111, 0, Number)
    this._defineProperty('green', 121, 0, Number)
    this._defineProperty('blue', 131, 0, Number)
    this._defineProperty('white', 141, 0, Number)
    this._defineProperty('gain', 151, 0, Number)
    this._defineProperty('colorTemperature', 161, 0, Number)
    this._defineProperty('brightness', 171, 0, Number)
    this._defineProperty('switch', 181, false, Boolean)
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

ShellyBulb.coapTypeIdentifier = 'SHBLB-1'

module.exports = ShellyBulb
