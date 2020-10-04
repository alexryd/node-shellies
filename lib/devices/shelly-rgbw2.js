const { Device } = require('./base')

class ShellyRGBW2 extends Device {
  constructor(id, host, mode = 'color') {
    super(id, host)

    this._defineBooleanProperty('switch', 'color')

    this._defineNumberProperty('red', 'color')
    this._defineNumberProperty('green', 'color')
    this._defineNumberProperty('blue', 'color')
    this._defineNumberProperty('white', 'color')
    this._defineNumberProperty('gain', 'color')

    this._defineBooleanProperty('switch0', 'white')
    this._defineNumberProperty('brightness0', 'white')
    this._defineBooleanProperty('switch1', 'white')
    this._defineNumberProperty('brightness1', 'white')
    this._defineBooleanProperty('switch2', 'white')
    this._defineNumberProperty('brightness2', 'white')
    this._defineBooleanProperty('switch3', 'white')
    this._defineNumberProperty('brightness3', 'white')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')
    this._defineNumberProperty('power1', 'white')
    this._defineNumberProperty('energyCounter1', 'white')
    this._defineNumberProperty('power2', 'white')
    this._defineNumberProperty('energyCounter2', 'white')
    this._defineNumberProperty('power3', 'white')
    this._defineNumberProperty('energyCounter3', 'white')

    this._defineBooleanProperty('overPower')

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')

    this._defineStringProperty('mode', null, mode)

    this._mapCoapProperties({
      switch: [161, 1101],
      red: [111, 5105],
      green: [121, 5106],
      blue: [131, 5107],
      white: [141, 5108],
      gain: [151, 5102],

      switch0: [151, 1101],
      brightness0: [111, 5101],
      switch1: [161, 1201],
      brightness1: [121, 5201],
      switch2: [171, 1301],
      brightness2: [131, 5301],
      switch3: [181, 1401],
      brightness3: [141, 5401],

      power0: [4101],
      energyCounter0: [4103],
      power1: [4201],
      energyCounter1: [4203],
      power2: [4301],
      energyCounter2: [4303],
      power3: [4401],
      energyCounter3: [4403],

      overPower: [6102],

      input0: [118, 2101],
      inputEvent0: [2102],
      inputEventCounter0: [2103],

      mode: [9101],
    })
  }

  _applyCoapUpdate(msg, updates) {
    if (msg.protocolRevision === '1') {
      // if properties 171 and 181 are part of the updates, we expect the device
      // to be in "white" mode
      const r = updates.reduce((a, t) => {
        return a + (t[1] === 171 || t[1] === 181 ? 1 : 0)
      }, 0)
      this.mode = r >= 2 ? 'white' : 'color'
    }

    super._applyCoapUpdate(msg, updates)
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
    const query = Object.assign({}, opts)

    if (Object.prototype.hasOwnProperty.call(query, 'switch')) {
      // rename 'switch' to 'turn'
      query.turn = query.switch ? 'on' : 'off'
      delete query.switch
    }

    await this.httpRequest
      .get(`${this.host}/color/0`)
      .query(query)
  }

  /**
   * Sends a request to set the brightness and switch state of this device.
   * @param {number} index - The index of the light to control.
   * @param {number} brightness - A number between 0 and 100.
   * @param {boolean} on - Whether the light should be switched on.
   */
  async setWhite(index, brightness, on) {
    await this.httpRequest
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
