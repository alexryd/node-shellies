const ShellyDoorWindow = require('./shelly-door-window')

class ShellyDoorWindow2 extends ShellyDoorWindow {
  constructor(id, host) {
    super(id, host)

    this._defineProperty('temperature', [3101], 0, Number)
  }
}

ShellyDoorWindow2.deviceType = 'SHDW-2'
ShellyDoorWindow2.deviceName = 'Shelly Door/Window 2'

module.exports = ShellyDoorWindow2
