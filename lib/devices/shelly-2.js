const querystring = require('querystring')

const { Switch } = require('./base')

class Shelly2 extends Switch {
  constructor(id, host, mode = 'relay') {
    super(id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('rollerPosition', 113, 0, Number, 'roller')
    this._defineProperty('input0', 118, 0, Number)
    this._defineProperty('relay1', 122, false, Boolean)
    this._defineProperty('input1', 128, 0, Number)

    this._defineProperty('mode', -10, mode, mode => {
      if (mode !== 'relay' && mode !== 'roller') {
        throw new Error(`Invalid device mode "${mode}"`)
      }

      this._updateRollerState(mode)

      return mode
    })

    this._defineProperty('rollerState', -21, 'stop', state => {
      if (state !== 'open' && state !== 'close' && state !== 'stop') {
        throw new Error(`Invalid roller state "${state}"`)
      }
      return state
    }, 'roller')
  }

  _updateRollerState(mode) {
    if (mode === 'roller') {
      const swap = this.settings && this.settings.rollers &&
        this.settings.rollers.length > 0
        ? !!this.settings.rollers[0].swap : false

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
    // if property 113 is part of the updates, we expect the device to be in
    // "roller" mode
    const r = updates.reduce((a, t) => {
      return a + (t[1] === 113 ? 1 : 0)
    }, 0)
    this.mode = r >= 1 ? 'roller' : 'relay'

    super._applyUpdate(msg, updates)
    this._updateRollerState(this.mode)
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

Shelly2.coapTypeIdentifier = 'SHSW-21'
Shelly2.modelName = 'Shelly 2'

module.exports = Shelly2
