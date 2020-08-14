const ShellySmoke = require('./shelly-smoke')

class ShellySmoke2 extends ShellySmoke {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('humidity', [3103], 0, Number)
  }
}

ShellySmoke2.deviceType = 'SHSM-02'
ShellySmoke2.deviceName = 'Shelly Smoke 2'

module.exports = ShellySmoke2
