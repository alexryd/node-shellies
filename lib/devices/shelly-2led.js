const { Device } = require('./base')

class Shelly2LED extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('switch0', [1101], false, Boolean)
    this._defineProperty('brightness0', [5101], 0, Number)

    this._defineProperty('switch1', [1201], false, Boolean)
    this._defineProperty('brightness1', [5201], 0, Number)
  }

  async setWhite(index, brightness, on) {
    await this.request
      .get(`${this.host}/light/${index}`)
      .query({
        turn: on ? 'on' : 'off',
        brightness,
      })
  }
}

Shelly2LED.deviceType = 'SH2LED-1'
Shelly2LED.deviceName = 'Shelly 2LED'

module.exports = Shelly2LED
