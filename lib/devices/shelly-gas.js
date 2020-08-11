const { Device } = require('./base')

class ShellyGas extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('sensorState', 118, '', String)
    this._defineProperty('alarmState', 119, '', String)
    this._defineProperty('selfTestState', 120, '', String)
    this._defineProperty('concentration', 122, 0, Number)
  }
}

ShellyGas.coapTypeIdentifier = 'SHGS-1'

module.exports = ShellyGas
