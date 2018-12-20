const EventEmitter = require('events')

const request = require('./http-request')

class Device extends EventEmitter {
  static async createFromStatusMessage(msg) {
    const device = Device.create(
      msg.deviceType,
      msg.deviceId,
      msg.host
    )

    if (device) {
      device.settings = await device.getSettings()
      device.update(msg)
    }

    return device
  }

  static create(type, id, host) {
    const deviceClass = Device.deviceTypeToClass(type)
    if (deviceClass) {
      return new deviceClass(type, id, host)
    }

    return null
  }

  static deviceTypeToClass(type) {
    if (type === 'SHSW-1') {
      return Shelly1
    } else if (type === 'SHSW-21' || type === 'SHSW-22') {
      return Shelly2
    }

    return null
  }

  constructor(type, id, host) {
    super()

    this.type = type
    this.id = id
    this._online = true
    this._lastSerial = null
    this._ttl = null
    this._ttlTimer = null

    this._defineProperty('host', host)
    this._defineProperty('settings', null)
  }

  get online() {
    return this._online
  }

  set online(newValue) {
    if (!!newValue !== this._online) {
      this._online = !!newValue
      this.emit(this._online ? 'online' : 'offline')
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

  _defineProperty(name, defaultValue = null) {
    const key = `_${name}`

    Object.defineProperty(this, key, {
      value: defaultValue,
      writable: true,
    })

    Object.defineProperty(this, name, {
      get() { return this[key] },
      set(newValue) {
        if (this[key] !== newValue) {
          const oldValue = this[key]
          this[key] = newValue
          this.emit('change', name, newValue, oldValue)
          this.emit(`change:${name}`, newValue, oldValue)
        }
      },
      enumerable: true,
    })
  }

  update(msg) {
    this.online = true

    if (msg.validFor) {
      this.ttl = msg.validFor
    }

    if (msg.serial && msg.serial !== this._lastSerial) {
      this._lastSerial = msg.serial
      this._applyUpdate(msg, msg.payload && msg.payload.G || [])
    }
  }

  _applyUpdate(msg, updates) {
    this.host = msg.host
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

class Shelly1 extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('relay0', false)
  }

  _applyUpdate(msg, updates) {
    super._applyUpdate(msg, updates)

    for (let tuple of updates) {
      if (tuple[1] === 112) {
        this.relay0 = !!tuple[2]
      }
    }
  }

  async setRelay(index, value) {
    await request
      .get(`${this.host}/relay/${index}`)
      .query({ turn: value ? 'on' : 'off' })
  }
}

class Shelly2 extends Device {
  constructor(type, id, host) {
    super(type, id, host)

    this._defineProperty('powerMeter0', 0)
    if (type === 'SHSW-22') {
      this._defineProperty('powerMeter1', 0)
    }
    this._defineProperty('relay0', false)
    this._defineProperty('relay1', false)
  }

  _applyUpdate(msg, updates) {
    super._applyUpdate(msg, updates)

    for (let tuple of updates) {
      if (tuple[1] === 111) {
        this.powerMeter0 = tuple[2]
      } else if (tuple[1] === 112) {
        this.relay0 = !!tuple[2]
      } else if (tuple[1] === 121) {
        this.powerMeter1 = tuple[2]
      } else if (tuple[1] === 122) {
        this.relay1 = !!tuple[2]
      }
    }
  }

  async setRelay(index, value) {
    await request
      .get(`${this.host}/relay/${index}`)
      .query({ turn: value ? 'on' : 'off' })
  }
}

module.exports = Device
