const { Device } = require('./base')

class ShellyRGBW2 extends Device {
  constructor(id, host, mode = 'color') {
    super(id, host)

    this._defineProperty('mode', -10, mode, String)

    this._defineProperty('input0', 118, 0, Number)

    this._defineProperty('red', 111, 0, Number, 'color')
    this._defineProperty('green', 121, 0, Number, 'color')
    this._defineProperty('blue', 131, 0, Number, 'color')
    this._defineProperty('white', 141, 0, Number, 'color')
    this._defineProperty('gain', 151, 0, Number, 'color')
    this._defineProperty('switch', 161, false, Boolean, 'color')

    this._defineProperty('brightness0', 111, 0, Number, 'white')
    this._defineProperty('brightness1', 121, 0, Number, 'white')
    this._defineProperty('brightness2', 131, 0, Number, 'white')
    this._defineProperty('brightness3', 141, 0, Number, 'white')
    this._defineProperty('switch0', 151, false, Boolean, 'white')
    this._defineProperty('switch1', 161, false, Boolean, 'white')
    this._defineProperty('switch2', 171, false, Boolean, 'white')
    this._defineProperty('switch3', 181, false, Boolean, 'white')
  }

  _applyUpdate(msg, updates) {
    // if properties 171 and 181 are part of the updates, we expect the device
    // to be in "white" mode
    const r = updates.reduce((a, t) => {
      return a + (t[1] === 171 || t[1] === 181 ? 1 : 0)
    }, 0)
    this.mode = r >= 2 ? 'white' : 'color'

    super._applyUpdate(msg, updates)
  }

  async setColor(opts) {
    const query = Object.assign({}, opts)
    if (Object.prototype.hasOwnProperty.call(query, 'switch')) {
      query.turn = query.switch ? 'on' : 'off'
      delete query.switch
    }

    await this.request
      .get(`${this.host}/color/0`)
      .query(query)
  }

  async setWhite(index, brightness, on) {
    await this.request
      .get(`${this.host}/white/${index}`)
      .query({
        turn: on ? 'on' : 'off',
        brightness,
      })
  }
}

ShellyRGBW2.coapTypeIdentifier = 'SHRGBW2'

module.exports = ShellyRGBW2
