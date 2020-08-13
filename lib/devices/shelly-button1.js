const { Device } = require('./base')

class ShellyButton1 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('battery', 77, 0, Number)

    this._defineProperty('input0', 118, 0, Number)
    this._defineProperty('inputEvent0', 119, '', String)
    this._defineProperty('inputEventCounter0', 120, 0, Number)
  }
}

ShellyButton1.coapTypeIdentifier = 'SHBTN-1'
ShellyButton1.modelName = 'Shelly Button 1'

module.exports = ShellyButton1
