const { Device } = require('./base')

class ShellyDuo extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('switch')

    this._defineNumberProperty('brightness')
    this._defineNumberProperty('colorTemperature')
    this._defineNumberProperty('whiteLevel')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')

    this._mapCoapProperties({
      switch: [121, 1101],

      brightness: [111, 5101],
      colorTemperature: [131, 5103],
      whiteLevel: [5104],

      power0: [141, 4101],
      energyCounter0: [211, 4103],
    })

    this._mapMqttTopics({
      switch: 'light/0/status.ison',

      brightness: 'light/0/status.brightness',
      colorTemperature: 'light/0/status.temp',
      whiteLevel: 'light/0/status.white',

      power0: 'light/0/power',
      energyCounter0: 'light/0/energy',
    })
  }

  /**
   * Sends a request to set the color temperature, brightness and switch state
   * of this device.
   * @param {number} temperature - A number between 3000 and 6500.
   * @param {number} brightness - A number between 0 and 100.
   * @param {boolean} on - Whether the light should be switched on.
   */
  async setWhite(temperature, brightness, on) {
    // calculate the white level based on the temperature
    const white = (temperature - 2700) / (6500 - 2700) * 100

    await this.httpRequest
      .get(`${this.host}/light/0`)
      .query({
        turn: on ? 'on' : 'off',
        temp: temperature,
        white: Math.max(Math.min(Math.round(white), 100), 0),
        brightness,
      })
  }
}

ShellyDuo.deviceType = 'SHBDUO-1'
ShellyDuo.deviceName = 'Shelly Duo'

module.exports = ShellyDuo
