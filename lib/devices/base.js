const defaults = require('superagent-defaults')
const EventEmitter = require('eventemitter3')

const Http = require('../http')

/**
 * Represents a Shelly device.
 */
class Device extends EventEmitter {
  /**
   * @param {string} id - Device ID. Usually consists of 6 or 12 hexadecimal
   * figures.
   * @param {string} host - IP address or hostname.
   */
  constructor(id, host) {
    super()

    this.id = id
    this.lastSeen = null
    this._online = false
    this._ttl = 0
    this._ttlTimer = null
    this._name = null
    this._props = new Map()
    this._httpRequest = null

    this._defineProperty('host', null, host)
    this._defineProperty('mqttId')
    this._defineProperty('settings')
  }

  /**
   * The device type identifier, such as SHSW-1 or SHHT-1.
   */
  get type() {
    return this.constructor.deviceType
  }

  /**
   * The name of this Shelly device model.
   */
  get modelName() {
    return this.constructor.deviceName
  }

  /**
   * Whether this device is regarded as online.
   */
  get online() {
    return this._online
  }

  /**
   * Sets whether this device is regarded as online. Setting this value will
   * emit an 'online' or 'offline' event.
   */
  set online(newValue) {
    if (!!newValue !== this._online) {
      this._online = !!newValue
      this.emit(this._online ? 'online' : 'offline', this)
    }
  }

  /**
   * The number of milliseconds that this device will be regarded as online.
   */
  get ttl() {
    return this._ttl
  }

  /**
   * Sets the number of milliseconds that this device will be regarded as
   * online. Setting this property will start a timer for the given number of
   * milliseconds. When this timer goes off, the device will be set to offline.
   * Setting this property again, even to the same value, will reset the timer.
   */
  set ttl(newValue) {
    // if a timer is running, clear it
    if (this._ttlTimer !== null) {
      clearTimeout(this._ttlTimer)
      this._ttlTimer = null
    }

    this._ttl = newValue

    if (this._ttl > 0) {
      // start a timer that will set this device to offline
      this._ttlTimer = setTimeout(
        () => { this.online = false },
        this._ttl
      )
    }
  }

  /**
   * The name of this device. If a name has been set for this device, that value
   * will be returned. If a name is found in the device settings, that value
   * will be returned instead. If none of those are set, this property will be
   * `undefined`.
   */
  get name() {
    if (this._name) {
      return this._name
    } else if (this.settings) {
      return this.settings.name
    }
    return undefined
  }

  /**
   * Sets the name of this device.
   */
  set name(value) {
    this._name = value
  }

  /**
   * A request object that can be used to make HTTP requests to this device.
   */
  get httpRequest() {
    return this._httpRequest || Http.request
  }

  /**
   * Iterates through the device properties.
   */
  * [Symbol.iterator]() {
    // first go through the properties that apply to all modes
    if (this._props.has('*')) {
      // adding the props to a new Set here to filter out duplicates
      for (const prop of new Set(this._props.get('*').values())) {
        yield [prop, this[prop]]
      }
    }

    // then go through the properties for the current mode
    if (this.mode && this._props.has(this.mode)) {
      // adding the props to a new Set here to filter out duplicates
      for (const prop of new Set(this._props.get(this.mode).values())) {
        yield [prop, this[prop]]
      }
    }
  }

  /**
   * Defines a property for this device.
   * @param {string} name - The property name.
   * @param {string|array} ids - The ID or IDs of the corresponding CoAP
   * property.
   * @param {any} defaultValue - The initial value for this property.
   * @param {function} validator - A function that will be supplied every new
   * value assigned to this property. This function must return a valid value or
   * throw an error if the assigned value is invalid.
   * @param {string} mode - The device mode that this property is available for,
   * or `'*'` for any mode.
   */
  _defineProperty(name, ids = null, defaultValue = null, validator = null,
    mode = '*') {
    const key = `_${name}`

    // create a private property for storing the actual value
    Object.defineProperty(this, key, {
      value: defaultValue,
      writable: true,
    })

    // define a property with getter and setter
    Object.defineProperty(this, name, {
      get() {
        // simply return the value of our private property
        return this[key]
      },
      set(newValue) {
        // run the validator, if available
        const nv = validator ? validator(newValue) : newValue
        // only update the value if it has changed
        if (this[key] !== nv) {
          const oldValue = this[key]
          // store the new value in our private property
          this[key] = nv
          // emit a general change event
          this.emit('change', name, nv, oldValue, this)
          // emit a change event for this specific property
          this.emit(`change:${name}`, nv, oldValue, this)
        }
      },
      enumerable: true,
    })

    if (ids !== null) {
      if (!Array.isArray(ids)) {
        ids = [ids]
      }

      // add the CoAP property IDs to our map of properties
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

  /**
   * Returns the property name for the given CoAP property ID and device mode.
   * @param {string} id - The CoAP property ID.
   * @param {string} mode - The device mode.
   */
  _getPropertyName(id, mode = '*') {
    const p = this._props
    if (mode !== '*' && p.has(mode) && p.get(mode).has(id)) {
      return p.get(mode).get(id)
    } else if (p.has('*')) {
      return p.get('*').get(id)
    }
    return undefined
  }

  /**
   * Applies an update to this device's properties that has been received over
   * CoAP.
   * @param {Object} msg - The CoAP message.
   */
  applyCoapUpdate(msg) {
    if (msg.validFor) {
      // if this message defines how long this update is valid for, set `ttl`
      this.ttl = msg.validFor * 1000
    }

    // get the list of properties from the payload
    const updates = (msg.payload && msg.payload.G) || []
    if (updates && !Array.isArray(updates)) {
      throw new Error(
        `Invalid CoAP status payload: ${JSON.stringify(msg.payload)}`
      )
    }

    // apply the updates
    this._applyCoapUpdate(msg, updates)

    this.online = true
    this.lastSeen = new Date()
  }

  /**
   * Takes a list of properties received over CoAP and updates this device's
   * properties.
   * @param {Object} msg - The CoAP message.
   * @param {array} updates - A list of properties.
   */
  _applyCoapUpdate(msg, updates) {
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

  /**
   * Sets the username and password that will be used when making HTTP requests
   * to this device.
   * @param {string} username
   * @param {string} password
   */
  setHttpAuthCredentials(username, password) {
    if (this._httpRequest === null) {
      // wrap the request object
      this._httpRequest = defaults(Http.request)
    }
    this._httpRequest.auth(username, password)
  }

  /**
   * Requests the settings for this device.
   * @returns {Object}
   */
  async getSettings() {
    const res = await this.httpRequest.get(`${this.host}/settings`)
    return res.body
  }

  /**
   * Requests the status for this device.
   * @returns {Object}
   */
  async getStatus() {
    const res = await this.httpRequest.get(`${this.host}/status`)
    return res.body
  }

  /**
   * Sends a request to reboot the device.
   */
  async reboot() {
    await this.httpRequest.get(`${this.host}/reboot`)
  }
}

/**
 * Base class for all devices that have one or more relays.
 */
class Switch extends Device {
  /**
   * Sends a request to set the relay with the given index to either on or off.
   * @param {number} index - The relay index.
   * @param {boolean} value - Whether the relay should be turned on.
   */
  async setRelay(index, value) {
    await this.httpRequest
      .get(`${this.host}/relay/${index}`)
      .query({ turn: value ? 'on' : 'off' })
  }
}

module.exports = {
  Device,
  Switch,
}
