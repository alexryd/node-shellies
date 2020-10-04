const { Device } = require('./base')

/**
 * Represents devices of types that we don't recognize.
 */
class UnknownDevice extends Device {
  constructor(id, host, type) {
    super(id, host)

    this._type = type

    this._defineStringProperty('coapData')
    this._defineStringProperty('mqttData')
  }

  get type() {
    // return the type of the unknown device, rather than the type defined for
    // this class
    return this._type
  }

  _applyCoapUpdate(msg, updates) {
    // store the properties as a JSON string
    this.coapData = JSON.stringify(updates)
  }

  _applyMqttUpdate(update) {
    // store the properties as a JSON string
    this.mqttData = JSON.stringify(Object.fromEntries(update))
  }
}

UnknownDevice.deviceType = 'UNKNOWN'
UnknownDevice.deviceName = 'Unknown Device'

module.exports = UnknownDevice
