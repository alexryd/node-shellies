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
    this._coapProps = new Map()
    this._mqttProps = new Map()
    this._httpRequest = null

    this._defineStringProperty('host', null, host)
    this._defineStringProperty('mqttId')
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
    // iterate over all device properties
    for (const [name, mode] of this._props) {
      // if a mode is set, make sure this property is visible in that mode
      if (this.mode && mode && mode !== this.mode) {
        continue
      }

      yield [name, this[name]]
    }
  }

  /**
   * Defines a property for this device.
   * @param {string} name - The property name.
   * @param {string} mode - The device mode that this property is available for.
   * @param {any} defaultValue - The initial value for this property.
   * @param {function} validator - A function that will be supplied every new
   * value assigned to this property. This function must return a valid value or
   * throw an error if the assigned value is invalid.
   */
  _defineProperty(name, mode = null, defaultValue = null, validator = null) {
    const key = `_${name}`

    // define a private property for storing the actual value
    Object.defineProperty(this, key, {
      value: typeof defaultValue !== 'undefined' ? defaultValue : null,
      writable: true,
    })

    // define a public property with a getter and a setter
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

    // store the mode of this prop
    this._props.set(name, mode || '')
  }

  /**
   * Shorthand method for defining a boolean property.
   * @param {string} name - The property name.
   * @param {string} mode - The device mode that this property is available for.
   * @param {any} defaultValue - The initial value for this property.
   */
  _defineBooleanProperty(name, mode = null, defaultValue = false) {
    this._defineProperty(name, mode, defaultValue, val => {
      if (val === 'on' || val === 'open') {
        return true
      } else if (val === 'off' || val === 'close') {
        return false
      }
      return Boolean(val)
    })
  }

  /**
   * Shorthand method for defining a number property.
   * @param {string} name - The property name.
   * @param {string} mode - The device mode that this property is available for.
   * @param {any} defaultValue - The initial value for this property.
   */
  _defineNumberProperty(name, mode = null, defaultValue = 0) {
    this._defineProperty(name, mode, defaultValue, Number)
  }

  /**
   * Shorthand method for defining a string property.
   * @param {string} name - The property name.
   * @param {string} mode - The device mode that this property is available for.
   * @param {any} defaultValue - The initial value for this property.
   */
  _defineStringProperty(name, mode = null, defaultValue = '') {
    this._defineProperty(name, mode, defaultValue, String)
  }

  /**
   * Takes a map of device property names and CoAP property IDs and adds it to
   * this device so that they will be mapped when an update is applied.
   * @param {object} map - A map with property names as keys and a CoAP property
   * ID or an array of CoAP property IDs as values.
   */
  _mapCoapProperties(map) {
    for (const prop in map) {
      // get the mode for this property
      const mode = this._props.get(prop)
      if (typeof mode === 'undefined') {
        throw new Error(`Unknown property "${prop}"`)
      }

      // get the map for this mode
      let idMap = this._coapProps.get(mode)
      if (!idMap) {
        // create it if it doesn't exist
        idMap = new Map()
        this._coapProps.set(mode, idMap)
      }

      const ids = Array.isArray(map[prop]) ? map[prop] : [map[prop]]

      // add the CoAP property IDs to our map of properties
      for (const id of ids) {
        // make sure this ID hasn't already been assigned a property
        if (idMap.has(id)) {
          throw new Error(`Cannot reassign CoAP property "${id}"`)
        }

        idMap.set(id, prop)
      }
    }
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

    if (msg.host) {
      this.host = msg.host
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
    // get the map of property IDs to names for the default mode and also for
    // the current mode, if we have one
    const defaultIdMap = this._coapProps.get('') || new Map()
    const modeIdMap = this.mode ? this._coapProps.get(this.mode) : null

    // loop through each update
    for (const tuple of updates) {
      const propId = tuple[1]
      const value = tuple[2]

      // get the matching property and update it
      let prop = defaultIdMap.get(propId)
      if (!prop && modeIdMap) {
        prop = modeIdMap.get(propId)
      }

      if (prop) {
        this[prop] = value
      }
    }
  }

  /**
   * Takes a map of device property names and MQTT topics and adds it to this
   * device so that they will be mapped when an update is applied.
   * @param {object} map - A map with property names as keys and a MQTT topic or
   * an array of MQTT topics as values. MQTT topics may also be appended with an
   * object path to retrieve a value from within an object.
   */
  _mapMqttTopics(map) {
    for (const prop in map) {
      // make sure this property has been defined
      if (!this._props.has(prop)) {
        throw new Error(`Unknown property "${prop}"`)
      }

      const topics = Array.isArray(map[prop]) ? map[prop] : [map[prop]]

      // add the MQTT topics to our map of properties
      for (const t of topics) {
        // extract topic and object path
        const [topic, ...paths] = t.split('.')
        const path = paths.length > 0 ? paths.join('.') : ''

        // store the property name in a two dimensional map of topics and object
        // paths
        let pn = this._mqttProps.get(topic)
        if (!pn) {
          pn = new Map()
          this._mqttProps.set(topic, pn)
        }
        pn.set(path, prop)
      }
    }
  }

  /**
   * Applies an update to this device's properties that has been received over
   * MQTT.
   * @param {object} update - The update.
   */
  applyMqttUpdate(update) {
    this.host = update.device.host
    this.mqttId = update.device.mqttId

    this._applyMqttUpdate(update)

    this.online = true
    this.lastSeen = new Date()
  }

  /**
   * Applies an update to this device's properties that has been received over
   * MQTT.
   * @param {object} update - The update.
   */
  _applyMqttUpdate(update) {
    // loop through each update
    for (const [topic, value] of update) {
      // find any matching properties for this topic
      const op = this._mqttProps.get(topic)
      if (op) {
        // loop through each matching property
        for (const [path, prop] of op) {
          if (!path) {
            // if no object path is set, we can simply assign the value to this
            // property
            this[prop] = value
          } else {
            // if an object path is set, we need to follow that path to find the
            // actual value we're looking for
            const deepValue = path.split('.').reduce(
              (a, v) => a ? a[v] : undefined,
              value
            )
            // if found, assign it to the property
            if (typeof deepValue !== 'undefined') {
              this[prop] = deepValue
            }
          }
        }
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
