const ShellyPlug = require('./shelly-plug')

class ShellyPlugE extends ShellyPlug {}

ShellyPlugE.deviceType = 'SHPLG2-1'
ShellyPlugE.deviceName = 'Shelly Plug'

module.exports = ShellyPlugE
