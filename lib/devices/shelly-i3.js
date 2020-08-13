const { Device } = require('./base')

class ShellyI3 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('input0', 118, 0, Number)
    this._defineProperty('inputEvent0', 119, '', String)
    this._defineProperty('inputEventCounter0', 120, 0, Number)

    this._defineProperty('input1', 128, 0, Number)
    this._defineProperty('inputEvent1', 129, '', String)
    this._defineProperty('inputEventCounter1', 130, 0, Number)

    this._defineProperty('input2', 138, 0, Number)
    this._defineProperty('inputEvent2', 139, '', String)
    this._defineProperty('inputEventCounter2', 140, 0, Number)
  }
}

ShellyI3.coapTypeIdentifier = 'SHIX3-1'
ShellyI3.modelName = 'Shelly i3'

module.exports = ShellyI3
