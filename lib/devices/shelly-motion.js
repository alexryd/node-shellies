const { Device } = require('./base')

class ShellyMotion extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('motion', [6107], false, Boolean)
    this._defineProperty('vibration', [6110], false, Boolean)
    this._defineProperty('illuminance', [3106], 0, Number)
    this._defineProperty('battery', [3111], 0, Number)

  }
}

ShellyMotion.deviceType = 'SHMOS-01'
ShellyMotion.deviceName = 'Shelly Motion'

module.exports = ShellyMotion
