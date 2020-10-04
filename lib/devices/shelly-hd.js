const { Switch } = require('./base')

class ShellyHD extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('power0')
    this._defineBooleanProperty('relay0')
    this._defineNumberProperty('power1')
    this._defineBooleanProperty('relay1')

    this._mapCoapProperties({
      power0: [111],
      relay0: [112],
      power1: [121],
      relay1: [122],
    })
  }
}

ShellyHD.deviceType = 'SHSW-22'
ShellyHD.deviceName = 'Shelly HD'

module.exports = ShellyHD
