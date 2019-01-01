const EventEmitter = require('events')

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
    if (type === 'SHSW-1') {
      return Shelly1
    } else if (type === 'SHSW-21' || type === 'SHSW-22') {
      return Shelly2
    } else if (type === 'SHSW-44') {
      return Shelly4Pro
    }

    return undefined
  }

  constructor(type, id, host) {
    super()

    this.type = type
    this.id = id
    this._online = true
    this._lastSerial = null
    this._ttl = null
    this._ttlTimer = null
    this._props = new Map()

    this._defineProperty('host', null, host)
    this._defineProperty('settings')
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
        this._ttl * 1000
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

  update(msg) {
    this.online = true

    if (msg.validFor) {
      this.ttl = msg.validFor
    }

    if (msg.serial && msg.serial !== this._lastSerial) {
      this._lastSerial = msg.serial
      this._applyUpdate(msg, msg.payload ? msg.payload.G : [])
    }
  }

  _applyUpdate(msg, updates) {
    this.host = msg.host

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

  async setRelay(index, value) {
    await request
      .get(`${this.host}/relay/${index}`)
      .query({ turn: value ? 'on' : 'off' })
  }
}

class Shelly1 extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('relay0', 112, false, Boolean)
  }
}

class Shelly2 extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 111, 0, Number)
    this._defineProperty('relay0', 112, false, Boolean)
    if (type === 'SHSW-22') {
      this._defineProperty('powerMeter1', 121, 0, Number)
    }
    this._defineProperty('relay1', 122, false, Boolean)
  }
}

class Shelly4Pro extends Device {
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

module.exports = Device
