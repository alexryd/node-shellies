const { Switch } = require('./base')

class Shelly4Pro extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('power0')
    this._defineBooleanProperty('relay0')
    this._defineNumberProperty('power1')
    this._defineBooleanProperty('relay1')
    this._defineNumberProperty('power2')
    this._defineBooleanProperty('relay2')
    this._defineNumberProperty('power3')
    this._defineBooleanProperty('relay3')

    this._mapCoapProperties({
      power0: [111],
      relay0: [112],
      power1: [121],
      relay1: [122],
      power2: [131],
      relay2: [132],
      power3: [141],
      relay3: [142],
    })

    this._mapMqttTopics({
      power0: 'relay/0/power',
      relay0: 'relay/0',
      power1: 'relay/1/power',
      relay1: 'relay/1',
      power2: 'relay/2/power',
      relay2: 'relay/2',
      power3: 'relay/3/power',
      relay3: 'relay/3',
    })
  }
}

Shelly4Pro.deviceType = 'SHSW-44'
Shelly4Pro.deviceName = 'Shelly 4Pro'

module.exports = Shelly4Pro
