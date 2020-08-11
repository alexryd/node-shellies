const ShellyPlug = require('./shelly-plug')

class ShellyPlugS extends ShellyPlug {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('internalTemperature', 113, 0, Number)
    this._defineProperty('overheated', 115, false, Boolean)
  }
}

ShellyPlugS.coapTypeIdentifier = 'SHPLG-S'

module.exports = ShellyPlugS
