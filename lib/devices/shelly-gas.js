const { Device } = require('./base')

class ShellyGas extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('sensorOperation', [118, 3113], 'unknown', String)
    this._defineProperty('selfTest', [120, 3114], '', String)
    this._defineProperty('gas', [119, 6108], 'unknown', String)
    this._defineProperty('concentration', [122, 3107], 0, Number)
    this._defineProperty('valve', [1105], 'unknown', String)
  }
}

ShellyGas.deviceType = 'SHGS-1'
ShellyGas.deviceName = 'Shelly Gas'

module.exports = ShellyGas
