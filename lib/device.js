const EventEmitter = require('eventemitter3')
const querystring = require('querystring')

const request = require('./http-request')

class Device extends EventEmitter {
  static create(type, id, host, mode = undefined) {
    const DeviceClass = Device.deviceTypeToClass(type)
    return new DeviceClass(type, id, host, mode)
  }

  static deviceTypeToClass(type) {
    switch (type) {
      case 'SHBLB-1':
        return ShellyBulb
      case 'SHHT-1':
        return ShellyHT
      case 'SHPLG-1':
      case 'SHPLG2-1':
        return ShellyPlug
      case 'SHRGBW2':
        return ShellyRGBW2
      case 'SHSEN-1':
        return ShellySense
      case 'SHSW-1':
        return Shelly1
      case 'SHSW-21':
      case 'SHSW-25':
        return Shelly2
      case 'SHSW-22':
        return ShellyHD
      case 'SHSW-44':
        return Shelly4Pro
      case 'SHSW-PM':
        return Shelly1PM
      default:
        return UnknownDevice
    }
  }

  static isUnknown(device) {
    return device instanceof UnknownDevice
  }

  constructor(type, id, host) {
    super()

    this.type = type
    this.id = id
    this._online = false
    this._ttl = 0
    this._ttlTimer = null
    this._name = null
    this._props = new Map()

    this._defineProperty('host', null, host)
    this._defineProperty(
      'settings',
      null,
      null,
      this._settingsValidator.bind(this)
    )
  }

  get online() {
    return this._online
  }

  set online(newValue) {
    if (!!newValue !== this._online) {
      this._online = !!newValue
      this.emit(this._online ? 'online' : 'offline', this)
    }
  }

  get ttl() {
    return this._ttl
  }

  set ttl(newValue) {
    if (this._ttlTimer !== null) {
      clearTimeout(this._ttlTimer)
      this._ttlTimer = null
    }

    this._ttl = newValue

    if (this._ttl > 0) {
      this._ttlTimer = setTimeout(
        () => { this.online = false },
        this._ttl
      )
    }
  }

  get name() {
    if (this._name) {
      return this._name
    } else if (this.settings) {
      return this.settings.name
    }
    return undefined
  }

  set name(value) {
    this._name = value
  }

  * [Symbol.iterator]() {
    if (this._props.has('*')) {
      for (let prop of this._props.get('*').values()) {
        yield [prop, this[prop]]
      }
    }

    if (this.mode && this._props.has(this.mode)) {
      for (let prop of this._props.get(this.mode).values()) {
        yield [prop, this[prop]]
      }
    }
  }

  _defineProperty(name, id = null, defaultValue = null, validator = null,
    mode = '*') {
    const key = `_${name}`

    Object.defineProperty(this, key, {
      value: defaultValue,
      writable: true,
    })

    Object.defineProperty(this, name, {
      get() { return this[key] },
      set(newValue) {
        const nv = validator ? validator(newValue) : newValue
        if (this[key] !== nv) {
          const oldValue = this[key]
          this[key] = nv
          this.emit('change', name, nv, oldValue, this)
          this.emit(`change:${name}`, nv, oldValue, this)
        }
      },
      enumerable: true,
    })

    if (id !== null) {
      // make _props a two dimensional map of modes and properties
      let p = this._props.get(mode)
      if (!p) {
        p = new Map()
        this._props.set(mode, p)
      }
      p.set(id, name)
    }
  }

  _getPropertyName(id, mode = '*') {
    const p = this._props
    if (mode !== '*' && p.has(mode) && p.get(mode).has(id)) {
      return p.get(mode).get(id)
    } else if (p.has('*')) {
      return p.get('*').get(id)
    }
    return undefined
  }

  _settingsValidator(settings) {
    // subclasses can override this
    return settings
  }

  update(msg) {
    if (msg.validFor) {
      this.ttl = msg.validFor * 1000
    }

    this._applyUpdate(msg, msg.payload ? msg.payload.G : [])
    this.online = true
  }

  _applyUpdate(msg, updates) {
    if (msg.host) {
      this.host = msg.host
    }

    for (let tuple of updates) {
      const prop = this._getPropertyName(tuple[1], this.mode)
      if (prop) {
        this[prop] = tuple[2]
      }
    }
  }

  async getSettings() {
    const res = await request.get(`${this.host}/settings`)
    return res.body
  }

  async getStatus() {
    const res = await request.get(`${this.host}/status`)
    return res.body
  }

  async reboot() {
    await request.get(`${this.host}/reboot`)
  }
}

class Switch extends Device {
  async setRelay(index, value) {
    await request
      .get(`${this.host}/relay/${index}`)
      .query({ turn: value ? 'on' : 'off' })
  }
}

class Shelly1 extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('relay0', 112, false, Boolean)
  }
}

class Shelly1PM extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
  }
}

class Shelly2 extends Switch {
  constructor(type, id, host, mode = 'relay') {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('rollerPosition', 113, 0, Number, 'roller')
    if (type === 'SHSW-25') {
      this._defineProperty('powerMeter1', 121, 0, Number)
    }
    this._defineProperty('relay1', 122, false, Boolean)

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
    const res = await request.get(`${this.host}/roller/0?${qs}`)
    return res.body
  }

  async setRollerPosition(position) {
    const qs = querystring.stringify({
      go: 'to_pos',
      roller_pos: position,
    })
    const res = await request.get(`${this.host}/roller/0?${qs}`)
    return res.body
  }
}

class Shelly4Pro extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
    this._defineProperty('relay1', 122, false, Boolean)
    this._defineProperty('powerMeter2', 131, 0, Number)
    this._defineProperty('relay2', 132, false, Boolean)
    this._defineProperty('powerMeter3', 141, 0, Number)
    this._defineProperty('relay3', 142, false, Boolean)
  }
}

class ShellyBulb extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('red', 111, 0, Number)
    this._defineProperty('green', 121, 0, Number)
    this._defineProperty('blue', 131, 0, Number)
    this._defineProperty('white', 141, 0, Number)
    this._defineProperty('switch', 151, false, Boolean)
  }

  async setColor(opts) {
    const query = Object.assign({ mode: 'color' }, opts)
    if (query.hasOwnProperty('switch')) {
      query.turn = query.switch ? 'on' : 'off'
      delete query.switch
    }

    await request
      .get(`${this.host}/light/0`)
      .query(query)
  }

  async setWhite(temperature, brightness, on) {
    await request
      .get(`${this.host}/light/0`)
      .query({
        mode: 'white',
        turn: on ? 'on' : 'off',
        temp: temperature,
        brightness,
      })
  }
}

class ShellyHD extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    this._defineProperty('powerMeter1', 121, 0, Number)
    this._defineProperty('relay1', 122, false, Boolean)
  }
}

class ShellyHT extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('temperature', 33, 0, Number)
    this._defineProperty('humidity', 44, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

class ShellyPlug extends Switch {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
  }
}

class ShellyRGBW2 extends Device {
  constructor(type, id, host, mode = 'color') {
    super(type, id, host)

    this._defineProperty('mode', -10, mode, String)

    this._defineProperty('red', 111, 0, Number, 'color')
    this._defineProperty('green', 121, 0, Number, 'color')
    this._defineProperty('blue', 131, 0, Number, 'color')
    this._defineProperty('white', 141, 0, Number, 'color')
    this._defineProperty('gain', 151, 0, Number, 'color')
    this._defineProperty('switch', 161, false, Boolean, 'color')

    this._defineProperty('brightness0', 111, 0, Number, 'white')
    this._defineProperty('brightness1', 121, 0, Number, 'white')
    this._defineProperty('brightness2', 131, 0, Number, 'white')
    this._defineProperty('brightness3', 141, 0, Number, 'white')
    this._defineProperty('switch0', 151, false, Boolean, 'white')
    this._defineProperty('switch1', 161, false, Boolean, 'white')
    this._defineProperty('switch2', 171, false, Boolean, 'white')
    this._defineProperty('switch3', 181, false, Boolean, 'white')
  }

  _applyUpdate(msg, updates) {
    // if properties 171 and 181 are part of the updates, we expect the device
    // to be in "white" mode
    const r = updates.reduce((a, t) => {
      return a + (t[1] === 171 || t[1] === 181 ? 1 : 0)
    }, 0)
    this.mode = r >= 2 ? 'white' : 'color'

    super._applyUpdate(msg, updates)
  }

  async setColor(opts) {
    const query = Object.assign({}, opts)
    if (query.hasOwnProperty('switch')) {
      query.turn = query.switch ? 'on' : 'off'
      delete query.switch
    }

    await request
      .get(`${this.host}/color/0`)
      .query(query)
  }

  async setWhite(index, brightness, on) {
    await request
      .get(`${this.host}/white/${index}`)
      .query({
        turn: on ? 'on' : 'off',
        brightness,
      })
  }
}

class ShellySense extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('motion', 11, false, Boolean)
    this._defineProperty('charging', 22, false, Boolean)
    this._defineProperty('temperature', 33, 0, Number)
    this._defineProperty('humidity', 44, 0, Number)
    this._defineProperty('illuminance', 66, 0, Number)
    this._defineProperty('battery', 77, 0, Number)
  }
}

class UnknownDevice extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('payload', -99, null)
  }

  _applyUpdate(msg, updates) {
    if (msg.host) {
      this.host = msg.host
    }

    this.payload = JSON.stringify(updates)
  }
}

module.exports = {
  Device,
  UnknownDevice,
}
