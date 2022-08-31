const ShellyMotion = require('./shelly-motion')

class ShellyMotion2 extends ShellyMotion {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [33, 3101], 0, Number)
  }
}

ShellyMotion2.deviceType = 'SHMOS-02'
ShellyMotion2.deviceName = 'Shelly Motion 2'

module.exports = ShellyMotion2
