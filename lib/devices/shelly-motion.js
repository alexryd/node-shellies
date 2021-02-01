const { Device } = require('./base')

class ShellyMotion extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('motion', false, Boolean)

  }
}

ShellyMotion.deviceType = 'SHMOS-01'
ShellyMotion.deviceName = 'Shelly Motion'

module.exports = ShellyMotion
