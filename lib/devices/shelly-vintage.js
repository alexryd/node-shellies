const { Device } = require('./base')

class ShellyVintage extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('switch')

    this._defineNumberProperty('brightness')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')

    this._mapCoapProperties({
      switch: [121, 1101],

      brightness: [111, 5101],

      power0: [141, 4101],
      energyCounter0: [211, 4103],
    })

    this._mapMqttTopics({
      switch: 'light/0/status.ison',

      brightness: 'light/0/status.brightness',

      power0: 'light/0/power',
      energyCounter0: 'light/0/energy',
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

ShellyVintage.deviceType = 'SHVIN-1'
ShellyVintage.deviceName = 'Shelly Vintage'

module.exports = ShellyVintage
