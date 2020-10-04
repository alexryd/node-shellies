const querystring = require('querystring')

const { Switch } = require('./base')

class Shelly2 extends Switch {
  constructor(id, host, mode = 'relay') {
    super(id, host)

    this._defineBooleanProperty('relay0')
    this._defineBooleanProperty('relay1')

    this._defineNumberProperty('input0')
    this._defineStringProperty('inputEvent0')
    this._defineNumberProperty('inputEventCounter0')
    this._defineNumberProperty('input1')
    this._defineStringProperty('inputEvent1')
    this._defineNumberProperty('inputEventCounter1')

    this._defineNumberProperty('power0')
    this._defineNumberProperty('energyCounter0')

    this._defineStringProperty('mode', null, mode)

    this._defineBooleanProperty('overPower0', 'relay')
    this._defineBooleanProperty('overPower1', 'relay')
    this._defineNumberProperty('overPowerValue', 'relay')

    this._defineStringProperty('rollerState', 'roller', 'stop')
    this._defineNumberProperty('rollerPosition', 'roller')
    this._defineStringProperty('rollerStopReason', 'roller')

    this._mapCoapProperties({
      relay0: [112, 1101],
      relay1: [122, 1201],

      input0: [118, 2101],
      inputEvent0: [2102],
      inputEventCounter0: [2103],
      input1: [128, 2201],
      inputEvent1: [2202],
      inputEventCounter1: [2203],

      power0: [111, 4101, 4102],
      energyCounter0: [4103, 4104],

      mode: [9101],

      overPower0: [6102],
      overPower1: [6202],
      overPowerValue: [6109],

      rollerState: [1102],
      rollerPosition: [113, 1103],
      rollerStopReason: [6103],
    })
  }

  /**
   * Updates the `rollerState` property based on the states of the relays.
   * This method is only used for firmware < 1.8.0 that don't supply the roller
   * state over CoAP.
   * @param {string} mode - The current device mode.
   */
  _updateRollerState(mode) {
    if (mode === 'roller') {
      // try to see if the direction should be swapped, based on the settings
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

  /**
   * Adds custom handling of updates, to determine the device mode based on the
   * available properties and to update `rollerState`. This is only used for
   * CoIoT protocol revision 1 (eg. firmware < 1.8.0).
   */
  _applyCoapUpdate(msg, updates) {
    if (msg.protocolRevision === '1') {
      // if property 113 is part of the updates, we expect the device to be in
      // "roller" mode
      const r = updates.reduce((a, t) => {
        return a + (t[1] === 113 ? 1 : 0)
      }, 0)
      this.mode = r >= 1 ? 'roller' : 'relay'
    }

    super._applyCoapUpdate(msg, updates)

    if (msg.protocolRevision === '1') {
      this._updateRollerState(this.mode)
    }
  }

  /**
   * Sends a request to update the roller state.
   * @param {string} state - The new roller state. Must be either 'open',
   * 'close' or 'stop'.
   * @param {number} duration - The number of seconds that the motor should run
   * for.
   */
  async setRollerState(state, duration = null) {
    const params = { go: state }
    if (duration > 0) {
      params.duration = duration
    }

    const qs = querystring.stringify(params)
    const res = await this.httpRequest.get(`${this.host}/roller/0?${qs}`)
    return res.body
  }

  /**
   * Sends a request to move the roller shutter to the given position. Note that
   * the device must have been calibrated for this action to be available.
   * @param {number} position - A number between 0 and 100.
   */
  async setRollerPosition(position) {
    const qs = querystring.stringify({
      go: 'to_pos',
      roller_pos: position,
    })
    const res = await this.httpRequest.get(`${this.host}/roller/0?${qs}`)
    return res.body
  }
}

Shelly2.deviceType = 'SHSW-21'
Shelly2.deviceName = 'Shelly 2'

module.exports = Shelly2
