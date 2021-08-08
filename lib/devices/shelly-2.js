const querystring = require('querystring')

const { Switch } = require('./base')

class Shelly2 extends Switch {
  constructor(id, host, mode = 'relay') {
    super(id, host)

    this._defineProperty('relay0', [112, 1101], false, Boolean)
    this._defineProperty('relay1', [122, 1201], false, Boolean)

    this._defineProperty('input0', [118, 2101], 0, Number)
    this._defineProperty('inputEvent0', [2102], '', String)
    this._defineProperty('inputEventCounter0', [2103], 0, Number)
    this._defineProperty('input1', [128, 2201], 0, Number)
    this._defineProperty('inputEvent1', [2202], '', String)
    this._defineProperty('inputEventCounter1', [2203], 0, Number)

    this._defineProperty('power0', [111, 4101, 4102], 0, Number)
    this._defineProperty('energyCounter0', [4103, 4104], 0, Number)

    this._defineProperty('mode', [9101], mode, String)

    this._defineProperty('overPower0', [6102], 0, Number, 'relay')
    this._defineProperty('overPower1', [6202], 0, Number, 'relay')
    this._defineProperty('overPowerValue', [6109], 0, Number, 'relay')

    this._defineProperty('rollerState', [1102], 'stop', String, 'roller')
    this._defineProperty('rollerPosition', [113, 1103], 0, Number, 'roller')
    this._defineProperty('rollerStopReason', [6103], '', String, 'roller')
  }

  _updateRollerState(mode) {
    if (mode === 'roller') {
      const swap = this.settings && this.settings.rollers &&
        this.settings.rollers.length > 0
        ? !!this.settings.rollers[0].swap
        : false

      let state = 'stop'

      if (this.relay0) {
        state = swap ? 'close' : 'open'
      } else if (this.relay1) {
        state = swap ? 'open' : 'close'
      }

      this.rollerState = state
    }
  }

  _applyUpdate(msg, updates) {
    if (msg.protocolRevision === '1') {
      // if property 113 is part of the updates, we expect the device to be in
      // "roller" mode
      const r = updates.reduce((a, t) => {
        return a + (t[1] === 113 ? 1 : 0)
      }, 0)
      this.mode = r >= 1 ? 'roller' : 'relay'
    }

    super._applyUpdate(msg, updates)

    if (msg.protocolRevision === '1') {
      this._updateRollerState(this.mode)
    }
  }

  async setRollerState(state, duration = null) {
    const params = { go: state }
    if (duration > 0) {
      params.duration = duration
    }

    const qs = querystring.stringify(params)
    const res = await this.request.get(`${this.host}/roller/0?${qs}`)
    return res.body
  }

  async setRollerPosition(position) {
    const qs = querystring.stringify({
      go: 'to_pos',
      roller_pos: position,
    })
    const res = await this.request.get(`${this.host}/roller/0?${qs}`)
    return res.body
  }
}

Shelly2.deviceType = 'SHSW-21'
Shelly2.deviceName = 'Shelly 2'

module.exports = Shelly2
