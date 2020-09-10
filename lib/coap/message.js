const CoapOptions = require('./options')

/**
 * A CoAP response message.
 */
class CoapMessage {
  constructor(msg) {
    this.msg = msg
    this.host = msg.rsinfo.address

    const headers = msg.headers

    if (headers[CoapOptions.GLOBAL_DEVID]) {
      // extract device type, ID and the protocol revision from the device ID
      // header
      const parts = headers[CoapOptions.GLOBAL_DEVID].split('#')
      this.deviceType = parts[0]
      this.deviceId = parts[1]
      this.protocolRevision = parts[2]
    }

    if (headers[CoapOptions.STATUS_VALIDITY]) {
      // get the number of seconds that this message is valid for
      const validity = headers[CoapOptions.STATUS_VALIDITY]
      if ((validity & 0x1) === 0) {
        // LS bit is 0, divide by 10 to get the number of seconds
        this.validFor = Math.floor(validity / 10)
      } else {
        // LS bit is 1, multiply by 4 to get the number of seconds
        this.validFor = validity * 4
      }
    }

    if (headers[CoapOptions.STATUS_SERIAL]) {
      // get the serial number of this message
      this.serial = headers[CoapOptions.STATUS_SERIAL]
    }

    try {
      // parse JSON data
      this.payload = JSON.parse(msg.payload.toString())
    } catch (e) {
      // if the payload doesn't contain valid JSON data, store it as a string
      this.payload = msg.payload.toString()
    }
  }
}

module.exports = CoapMessage
