const { Switch } = require('./base')

class ShellyHD extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('power0', [111], 0, Number)
    this._defineProperty('relay0', [112], false, Boolean)
    this._defineProperty('power1', [121], 0, Number)
    this._defineProperty('relay1', [122], false, Boolean)
  }
}

ShellyHD.deviceType = 'SHSW-22'
ShellyHD.deviceName = 'Shelly HD'

module.exports = ShellyHD
