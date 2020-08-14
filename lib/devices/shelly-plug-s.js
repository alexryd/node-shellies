const ShellyPlug = require('./shelly-plug')

class ShellyPlugS extends ShellyPlug {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('deviceTemperature', [113, 3104], 0, Number)
    this._defineProperty('overTemperature', [115, 6101], false, Boolean)
  }
}

ShellyPlugS.coapTypeIdentifier = 'SHPLG-S'
ShellyPlugS.modelName = 'Shelly Plug S'

module.exports = ShellyPlugS
