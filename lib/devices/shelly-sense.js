const { Device } = require('./base')

class ShellySense extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('temperature')
    this._defineNumberProperty('humidity')
    this._defineBooleanProperty('motion')
    this._defineNumberProperty('illuminance')

    this._defineBooleanProperty('charging')
    this._defineNumberProperty('battery')

    this._mapCoapProperties({
      temperature: [33, 3101],
      humidity: [44, 3103],
      motion: [11, 6107],
      illuminance: [66, 3106],

      charging: [22, 3112],
      battery: [77, 3111],
    })

    this._mapMqttTopics({
      temperature: 'sensor/temperature',
      humidity: 'sensor/humidity',
      motion: 'sensor/motion',
      illuminance: 'sensor/lux',

      charging: 'sensor/charger',
      battery: 'sensor/battery',
    })
  }
}

ShellySense.deviceType = 'SHSEN-1'
ShellySense.deviceName = 'Shelly Sense'

module.exports = ShellySense
