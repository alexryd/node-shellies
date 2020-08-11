const { Device } = require('./base')

class ShellyDoorWindow extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('state', 55, false, Boolean)
    this._defineProperty('lux', 66, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

ShellyDoorWindow.coapTypeIdentifier = 'SHDW-1'

module.exports = ShellyDoorWindow
