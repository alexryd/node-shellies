const ShellyBulb = require('./shelly-bulb')

class ShellyBulbRGBW extends ShellyBulb {}

ShellyBulbRGBW.deviceType = 'SHCB-1'
ShellyBulbRGBW.deviceName = 'Shelly Bulb RGBW'

module.exports = ShellyBulbRGBW
