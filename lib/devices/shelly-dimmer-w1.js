const { Device } = require('./base')

class ShellyDimmerW1 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('switch')

    this._defineNumberProperty('brightness')

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')

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

      loadError: [6104],

      deviceTemperature: [3104],
      overTemperature: [6101],

      mode: [9101],
    })

    this._mapMqttTopics({
      switch: 'light/0/status.ison',

      brightness: 'light/0/status.brightness',

      input0: 'input/0',
      inputEvent0: 'input_event/0.event',
      inputEventCounter0: 'input_event/0.event_cnt',

      loadError: 'loaderror',

      deviceTemperature: 'temperature',
      overTemperature: 'overtemperature',

      mode: 'light/0/status.mode',
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

ShellyDimmerW1.deviceType = 'SHDIMW-1'
ShellyDimmerW1.deviceName = 'Shelly Dimmer W1'

module.exports = ShellyDimmerW1
