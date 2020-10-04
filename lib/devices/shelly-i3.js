const { Device } = require('./base')

class ShellyI3 extends Device {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')

    this._defineNumberProperty('input1')
    this._defineStringProperty('inputEvent1')
    this._defineNumberProperty('inputEventCounter1')

    this._defineNumberProperty('input2')
    this._defineStringProperty('inputEvent2')
    this._defineNumberProperty('inputEventCounter2')

    this._mapCoapProperties({
      input0: [118, 2101],
      inputEvent0: [119, 2102],
      inputEventCounter0: [120, 2103],

      input1: [128, 2201],
      inputEvent1: [129, 2202],
      inputEventCounter1: [130, 2203],

      input2: [138, 2301],
      inputEvent2: [139, 2302],
      inputEventCounter2: [140, 2303],
    })
  }
}

ShellyI3.deviceType = 'SHIX3-1'
ShellyI3.deviceName = 'Shelly i3'

module.exports = ShellyI3
