const { Device } = require('./base')

class ShellyButton1 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('input0', [118], 0, Number)
    this._defineProperty('inputEvent0', [119, 2102], '', String)
    this._defineProperty('inputEventCounter0', [120, 2103], 0, Number)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('charging', [3112], 0, Number)
    this._defineProperty('battery', [77, 3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellyButton1.deviceType = 'SHBTN-1'
ShellyButton1.deviceName = 'Shelly Button1'

module.exports = ShellyButton1
