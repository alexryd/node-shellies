const EventEmitter = require('eventemitter3')
const querystring = require('querystring')

const request = require('./http-request')

class Device extends EventEmitter {
  static create(type, id, host) {
    const DeviceClass = Device.deviceTypeToClass(type)
    if (DeviceClass) {
      return new DeviceClass(type, id, host)
    }

    return null
  }

  static deviceTypeToClass(type) {
    switch (type) {
      case 'SHHT-1':
        return ShellyHT
      case 'SHPLG-1':
      case 'SHPLG2-1':
        return ShellyPlug
      case 'SHSEN-1':
        return ShellySense
      case 'SHSW-1':
        return Shelly1
      case 'SHSW-21':
      case 'SHSW-25':
        return Shelly2
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

  * [Symbol.iterator]() {
    for (let prop of this._props.values()) {
      yield [prop, this[prop]]
    }
  }

  _defineProperty(name, id = null, defaultValue = null, validator = null) {
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
      this._props.set(id, name)
    }
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
      const prop = this._props.get(tuple[1])
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
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    if (type === 'SHSW-25') {
      this._defineProperty('powerMeter1', 121, 0, Number)
    }
    this._defineProperty('relay1', 122, false, Boolean)

    this._defineProperty('mode', -10, 'relay', mode => {
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
    })
  }

  _settingsValidator(settings) {
    if (settings !== null && settings.mode) {
      this.mode = settings.mode
    }
    return super._settingsValidator(settings)
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
