const EventEmitter = require('events')

const request = require('./http-request')

class Device extends EventEmitter {
  static async createFromStatusMessage(msg) {
    const res = await request.get(`${msg.host}/settings`)
    const deviceClass = Device.deviceTypeToClass(res.body.device.type)

    if (deviceClass) {
      const device = new deviceClass(msg.deviceId, msg.host)
      device.settings = res.body
      device.update(msg)
      return device
    } else {
      return null
    }
  }

  static deviceTypeToClass(type) {
    if (type === 'SHSW-1') {
      return Shelly1
    }

    return null
  }

  constructor(id, host) {
    super()

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
      this._applyUpdate(msg)
    }
  }

  _applyUpdate(msg) {
    this.host = msg.host
  }
}

class Shelly1 extends Device {
  constructor(id, host) {
    super(id, host)

    this.type = 'SHSW-1'

    this._defineProperty('relay0', false)
  }

  _applyUpdate(msg) {
    super._applyUpdate(msg)

    if (msg.payload && msg.payload.G) {
      for (let tuple of msg.payload.G) {
        if (tuple[1] === 112) {
          this.relay0 = !!tuple[2]
        }
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
