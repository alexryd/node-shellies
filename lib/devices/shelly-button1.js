const { Device } = require('./base')

class ShellyButton1 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')

    this._defineBooleanProperty('sensorError')

    this._defineBooleanProperty('charging')
    this._defineNumberProperty('battery')

    this._defineStringProperty('wakeUpEvent', null, 'unknown')

    this._mapCoapProperties({
      input0: [118],
      inputEvent0: [119, 2102],
      inputEventCounter0: [120, 2103],

      sensorError: [3115],

      charging: [3112],
      battery: [77, 3111],

      wakeUpEvent: [9102],
    })

    this._mapMqttTopics({
      input0: 'input/0',
      inputEvent0: 'input_event/0.event',
      inputEventCounter0: 'input_event/0.event_cnt',

      battery: 'sensor/battery',
    })
  }
}

ShellyButton1.deviceType = 'SHBTN-1'
ShellyButton1.deviceName = 'Shelly Button 1'

module.exports = ShellyButton1
