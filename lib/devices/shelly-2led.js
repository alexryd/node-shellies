const { Device } = require('./base')

class Shelly2LED extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('switch0')
    this._defineNumberProperty('brightness0')

    this._defineBooleanProperty('switch1')
    this._defineNumberProperty('brightness1')

    this._mapCoapProperties({
      switch0: [1101],
      brightness0: [5101],

      switch1: [1201],
      brightness1: [5201],
    })

    this._mapMqttTopics({
      switch0: 'light/0/status.ison',
      brightness0: 'light/0/status.brightness',

      switch1: 'light/1/status.ison',
      brightness1: 'light/1/status.brightness',
    })
  }

  /**
   * Sends a request to set the brightness and switch state of this device.
   * @param {number} index - The index of the light to control.
   * @param {number} brightness - A number between 0 and 100.
   * @param {boolean} on - Whether the light should be switched on.
   */
  async setWhite(index, brightness, on) {
    await this.httpRequest
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
