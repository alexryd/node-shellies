const { Device } = require('./base')

class ShellyDimmer extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('switch')

    this._defineNumberProperty('brightness')

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')
    this._defineNumberProperty('input1')
    this._defineStringProperty('inputEvent1')
    this._defineNumberProperty('inputEventCounter1')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')
    this._defineBooleanProperty('overPower')

    this._defineBooleanProperty('loadError')

    this._defineNumberProperty('deviceTemperature')
    this._defineBooleanProperty('overTemperature')

    this._defineStringProperty('mode', null, 'white')

    this._mapCoapProperties({
      switch: [121, 1101],

      brightness: [111, 5101],

      input0: [131, 2101],
      inputEvent0: [2102],
      inputEventCounter0: [2103],
      input1: [141, 2201],
      inputEvent1: [2202],
      inputEventCounter1: [2203],

      power0: [4101],
      energyCounter0: [4103],
      overPower: [6102],

      loadError: [6104],

      deviceTemperature: [3104],
      overTemperature: [6101],

      mode: [9101],
    })
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

ShellyDimmer.deviceType = 'SHDM-1'
ShellyDimmer.deviceName = 'Shelly Dimmer'

module.exports = ShellyDimmer
