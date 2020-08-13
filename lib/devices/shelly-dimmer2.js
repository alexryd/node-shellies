const ShellyDimmer = require('./shelly-dimmer')

class ShellyDimmer2 extends ShellyDimmer {}

ShellyDimmer2.coapTypeIdentifier = 'SHDM-2'
ShellyDimmer2.modelName = 'Shelly Dimmer 2'

module.exports = ShellyDimmer2
