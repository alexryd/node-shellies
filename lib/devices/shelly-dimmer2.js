const ShellyDimmer = require('./shelly-dimmer')

class ShellyDimmer2 extends ShellyDimmer {}

ShellyDimmer2.deviceType = 'SHDM-2'
ShellyDimmer2.deviceName = 'Shelly Dimmer 2'

module.exports = ShellyDimmer2
