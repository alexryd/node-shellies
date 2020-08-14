const { Device } = require('./base')

class ShellyFlood extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('externalTemperature', [33, 3101], 0, Number)
    this._defineProperty('flood', [23, 6106], false, Boolean)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('battery', [3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellyFlood.coapTypeIdentifier = 'SHWT-1'
ShellyFlood.modelName = 'Shelly Flood'

module.exports = ShellyFlood
