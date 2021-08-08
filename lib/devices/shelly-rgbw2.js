const { Device } = require('./base')

class ShellyRGBW2 extends Device {
  constructor(id, host, mode = 'color') {
    super(id, host)

    this._defineProperty('switch', [161, 1101], false, Boolean, 'color')

    this._defineProperty('red', [111, 5105], 0, Number, 'color')
    this._defineProperty('green', [121, 5106], 0, Number, 'color')
    this._defineProperty('blue', [131, 5107], 0, Number, 'color')
    this._defineProperty('white', [141, 5108], 0, Number, 'color')
    this._defineProperty('gain', [151, 5102], 0, Number, 'color')

    this._defineProperty('switch0', [151, 1101], false, Boolean, 'white')
    this._defineProperty('brightness0', [111, 5101], 0, Number, 'white')
    this._defineProperty('switch1', [161, 1201], false, Boolean, 'white')
    this._defineProperty('brightness1', [121, 5201], 0, Number, 'white')
    this._defineProperty('switch2', [171, 1301], false, Boolean, 'white')
    this._defineProperty('brightness2', [131, 5301], 0, Number, 'white')
    this._defineProperty('switch3', [181, 1401], false, Boolean, 'white')
    this._defineProperty('brightness3', [141, 5401], 0, Number, 'white')

    this._defineProperty('power0', [4101], 0, Number)
    this._defineProperty('energyCounter0', [4103], 0, Number)
    this._defineProperty('power1', [4201], 0, Number, 'white')
    this._defineProperty('energyCounter1', [4203], 0, Number, 'white')
    this._defineProperty('power2', [4301], 0, Number, 'white')
    this._defineProperty('energyCounter2', [4303], 0, Number, 'white')
    this._defineProperty('power3', [4401], 0, Number, 'white')
    this._defineProperty('energyCounter3', [4403], 0, Number, 'white')

    this._defineProperty('overPower', [6102], 0, Number)

    this._defineProperty('input0', [118, 2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)

    this._defineProperty('mode', [9101], mode, String)
  }

  _applyUpdate(msg, updates) {
    if (msg.protocolRevision === '1') {
      // if properties 171 and 181 are part of the updates, we expect the device
      // to be in "white" mode
      const r = updates.reduce((a, t) => {
        return a + (t[1] === 171 || t[1] === 181 ? 1 : 0)
      }, 0)
      this.mode = r >= 2 ? 'white' : 'color'
    }

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

ShellyRGBW2.deviceType = 'SHRGBW2'
ShellyRGBW2.deviceName = 'Shelly RGBW2'

module.exports = ShellyRGBW2
