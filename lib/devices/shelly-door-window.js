const { Device } = require('./base')

class ShellyDoorWindow extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('state', [55, 3108], 0, Number)
    this._defineProperty('tilt', [3109], 0, Number)
    this._defineProperty('vibration', [6110], 0, Number)
    this._defineProperty('illuminance', [66, 3106], 0, Number)
    this._defineProperty('illuminanceLevel', [3110], 'unknown', String)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('battery', [77, 3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellyDoorWindow.deviceType = 'SHDW-1'
ShellyDoorWindow.deviceName = 'Shelly Door/Window'

module.exports = ShellyDoorWindow
