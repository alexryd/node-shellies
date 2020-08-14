const defaults = require('superagent-defaults')
const EventEmitter = require('eventemitter3')

const request = require('../http-request')

class Device extends EventEmitter {
  constructor(id, host) {
    super()

    this.id = id
    this.lastSeen = null
    this._online = false
    this._ttl = 0
    this._ttlTimer = null
    this._name = null
    this._props = new Map()
    this._request = null

    this._defineProperty('host', null, host)
    this._defineProperty(
      'settings',
      null,
      null,
      this._settingsValidator.bind(this)
    )
  }

  get type() {
    return this.constructor.deviceType
  }

  get modelName() {
    return this.constructor.deviceName
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

  get request() {
    return this._request || request
  }

  * [Symbol.iterator]() {
    if (this._props.has('*')) {
      // adding the props to a new Set here to filter out duplicates
      for (const prop of new Set(this._props.get('*').values())) {
        yield [prop, this[prop]]
      }
    }

    if (this.mode && this._props.has(this.mode)) {
      // adding the props to a new Set here to filter out duplicates
      for (const prop of new Set(this._props.get(this.mode).values())) {
        yield [prop, this[prop]]
      }
    }
  }

  _defineProperty(name, ids = null, defaultValue = null, validator = null,
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

    if (ids !== null) {
      if (!Array.isArray(ids)) {
        ids = [ids]
      }

      for (const id of ids) {
        // make _props a two dimensional map of modes and properties
        let p = this._props.get(mode)
        if (!p) {
          p = new Map()
          this._props.set(mode, p)
        }
        p.set(id, name)
      }
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

    const updates = (msg.payload && msg.payload.G) || []
    if (updates && !Array.isArray(updates)) {
      throw new Error(
        `Malformed status payload: ${JSON.stringify(msg.payload)}`
      )
    }

    this._applyUpdate(msg, updates)

    this.online = true
    this.lastSeen = new Date()
  }

  _applyUpdate(msg, updates) {
    if (msg.host) {
      this.host = msg.host
    }

    for (const tuple of updates) {
      const prop = this._getPropertyName(tuple[1], this.mode)
      if (prop) {
        this[prop] = tuple[2]
      }
    }
  }

  setAuthCredentials(username, password) {
    if (this._request === null) {
      this._request = defaults(request)
    }
    this._request.auth(username, password)
  }

  async getSettings() {
    const res = await this.request.get(`${this.host}/settings`)
    return res.body
  }

  async getStatus() {
    const res = await this.request.get(`${this.host}/status`)
    return res.body
  }

  async reboot() {
    await this.request.get(`${this.host}/reboot`)
  }
}

class Switch extends Device {
  async setRelay(index, value) {
    await this.request
      .get(`${this.host}/relay/${index}`)
      .query({ turn: value ? 'on' : 'off' })
  }
}

module.exports = {
  Device,
  Switch,
}
