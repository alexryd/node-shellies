const { Switch } = require('./base')

class ShellyPlug extends Switch {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('relay0', [112, 1101], false, Boolean)

    this._defineProperty('power0', [111, 4101], 0, Number)
    this._defineProperty('energyCounter0', [4103], 0, Number)

    this._defineProperty('overPower', [6102], 0, Number)
    this._defineProperty('overPowerValue', [6109], 0, Number)
  }
}

ShellyPlug.deviceType = 'SHPLG-1'
ShellyPlug.deviceName = 'Shelly Plug'

module.exports = ShellyPlug
