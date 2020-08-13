const ShellyPlug = require('./shelly-plug')

class ShellyPlugS extends ShellyPlug {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('internalTemperature', 113, 0, Number)
    this._defineProperty('overheated', 115, false, Boolean)
  }
}

ShellyPlugS.coapTypeIdentifier = 'SHPLG-S'
ShellyPlugS.modelName = 'Shelly Plug S'

module.exports = ShellyPlugS
