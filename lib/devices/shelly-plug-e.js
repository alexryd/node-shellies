const ShellyPlug = require('./shelly-plug')

class ShellyPlugE extends ShellyPlug {}

ShellyPlugE.coapTypeIdentifier = 'SHPLG2-1'

module.exports = ShellyPlugE
