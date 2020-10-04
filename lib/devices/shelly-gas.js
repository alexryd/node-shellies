const { Device } = require('./base')

class ShellyGas extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineStringProperty('sensorOperation', null, 'unknown')
    this._defineStringProperty('selfTest')
    this._defineStringProperty('gas', null, 'unknown')
    this._defineNumberProperty('concentration')
    this._defineStringProperty('valve', null, 'unknown')

    this._mapCoapProperties({
      sensorOperation: [118, 3113],
      selfTest: [120, 3114],
      gas: [119, 6108],
      concentration: [122, 3107],
      valve: [1105],
    })
  }
}

ShellyGas.deviceType = 'SHGS-1'
ShellyGas.deviceName = 'Shelly Gas'

module.exports = ShellyGas
