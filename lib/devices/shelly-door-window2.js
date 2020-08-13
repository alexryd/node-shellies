const { Device } = require('./base')

class ShellyDoorWindow2 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('extTemp', 3101, 0, Number)
    this._defineProperty('luminosity', 3106, 0, Number)
    this._defineProperty('dwIsOpened', 3108, false, Boolean)
    this._defineProperty('tilt', 3109, 0, Number)
    this._defineProperty('luminosityLevel', 3110, 'unknown', String)
    this._defineProperty('battery', 3111, 0, Number)
    this._defineProperty('sensorError', 3115, false, Boolean)
    this._defineProperty('vibration', 6110, false, Boolean)
    this._defineProperty('wakeupEvent', 9102, 'unknown', String)
  }
}

ShellyDoorWindow2.coapTypeIdentifier = 'SHDW-2'
ShellyDoorWindow2.modelName = 'Shelly Door/Window 2'

module.exports = ShellyDoorWindow2
