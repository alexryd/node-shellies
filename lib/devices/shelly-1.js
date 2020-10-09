const { Switch } = require('./base')

class Shelly1 extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineBooleanProperty('relay0')

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')

    this._defineNumberProperty('externalTemperature0', null, null)
    this._defineNumberProperty('externalTemperature1', null, null)
    this._defineNumberProperty('externalTemperature2', null, null)

    this._defineNumberProperty('externalHumidity', null, null)

    this._defineNumberProperty('externalInput0', null, null)

    this._mapCoapProperties({
      relay0: [112, 1101],

      input0: [118, 2101],
      inputEvent0: [2102],
      inputEventCounter0: [2103],

      externalTemperature0: [119, 3101],
      externalTemperature1: [3201],
      externalTemperature2: [3301],

      externalHumidity: [3103],

      externalInput0: [3117],
    })

    this._mapMqttTopics({
      relay0: 'relay/0',

      input0: 'input/0',
      inputEvent0: 'input_event/0.event',
      inputEventCounter0: 'input_event/0.event_cnt',

      externalTemperature0: 'ext_temperature/0',
      externalTemperature1: 'ext_temperature/1',
      externalTemperature2: 'ext_temperature/2',

      externalHumidity: 'ext_humidity/0',

      externalInput0: 'ext_input/0',
    })
  }
}

Shelly1.deviceType = 'SHSW-1'
Shelly1.deviceName = 'Shelly 1'

module.exports = Shelly1
