const ShellyPlug = require('./shelly-plug')

class ShellyPlugS extends ShellyPlug {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('deviceTemperature', [113, 3104], 0, Number)
    this._defineProperty('overTemperature', [115, 6101], 0, Number)
  }
}

ShellyPlugS.deviceType = 'SHPLG-S'
ShellyPlugS.deviceName = 'Shelly Plug S'

module.exports = ShellyPlugS
