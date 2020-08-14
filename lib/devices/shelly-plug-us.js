const ShellyPlug = require('./shelly-plug')

class ShellyPlugUS extends ShellyPlug {}

ShellyPlugUS.deviceType = 'SHPLG-U1'
ShellyPlugUS.deviceName = 'Shelly Plug US'

module.exports = ShellyPlugUS
