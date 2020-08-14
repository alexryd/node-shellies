const { Device } = require('./base')

class ShellyI3 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('input0', [118, 2101], 0, Number)
    this._defineProperty('inputEvent0', [119, 2102], '', String)
    this._defineProperty('inputEventCounter0', [120, 2103], 0, Number)

    this._defineProperty('input1', [128, 2201], 0, Number)
    this._defineProperty('inputEvent1', [129, 2202], '', String)
    this._defineProperty('inputEventCounter1', [130, 2203], 0, Number)

    this._defineProperty('input2', [138, 2301], 0, Number)
    this._defineProperty('inputEvent2', [139, 2302], '', String)
    this._defineProperty('inputEventCounter2', [140, 2303], 0, Number)
  }
}

ShellyI3.deviceType = 'SHIX3-1'
ShellyI3.deviceName = 'Shelly i3'

module.exports = ShellyI3
