const { Device } = require('./base')

class ShellyBulbRGBW extends ShellyBulb {}

ShellyBulbRGBW.deviceType = 'SHCB-1'
ShellyBulbRGBW.deviceName = 'Shelly Bulb RGBW'

module.exports = ShellyBulbRGBW
