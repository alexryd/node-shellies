
/**
 * Holds an update of a Shelly device's properties, as a map of MQTT topics and
 * their values.
 * An update will expire after the given amount of time and invoke the given
 * expiration handler. The expiration timer will be reset every time a value is
 * stored in this update.
 */
class MqttUpdate extends Map {
  /**
   * @param {function} expiredHandler - The callback to invoke when this update
   * expires.
   * @param {number} expirationTime - The number of milliseconds before this
   * update expires.
   * @param {object} device - The associated device.
   */
  constructor(expiredHandler, expirationTime, device = null) {
    super()

    this.expiredHandler = expiredHandler
    this.expirationTime = expirationTime
    this._device = device
    this._timeout = setTimeout(expiredHandler, expirationTime)
  }

  /**
   * Returns the associated device; or null if none has been specified.
   */
  get device() {
    return this._device
  }

  /**
   * Associates this update to the given device.
   */
  set device(value) {
    this.delayExpiration()
    this._device = value
  }

  /**
   * Stores a value in this update.
   * @param {any} key - The MQTT topic.
   * @param {any} value - The value to store.
   */
  set(key, value) {
    this.delayExpiration()
    return super.set(key, value)
  }

  /**
   * Cancels this update by clearing the expiration timer.
   */
  cancel() {
    if (this._timeout !== null) {
      clearTimeout(this._timeout)
      this._timeout = null
    }
  }

  /**
   * Resets the expiration timer.
   */
  delayExpiration() {
    clearTimeout(this._timeout)
    this._timeout = setTimeout(this.expiredHandler, this.expirationTime, this)
  }
}

module.exports = MqttUpdate
