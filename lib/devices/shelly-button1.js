const { Device } = require('./base')

class ShellyButton1 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('input0', [118], 0, Number)
    this._defineProperty('inputEvent0', [119, 2102], '', String)
    this._defineProperty('inputEventCounter0', [120, 2103], 0, Number)

    this._defineProperty('sensorError', [3115], false, Boolean)

    this._defineProperty('charging', [3112], false, Boolean)
    this._defineProperty('battery', [77, 3111], 0, Number)

    this._defineProperty('wakeUpEvent', [9102], 'unknown', String)
  }
}

ShellyButton1.coapTypeIdentifier = 'SHBTN-1'
ShellyButton1.modelName = 'Shelly Button 1'

module.exports = ShellyButton1
