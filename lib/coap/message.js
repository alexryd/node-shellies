const CoapOptions = require('./options')

class CoapMessage {
  constructor(msg) {
    this.msg = msg
    this.host = msg.rsinfo.address

    const headers = msg.headers

    if (headers[CoapOptions.GLOBAL_DEVID]) {
      const parts = headers[CoapOptions.GLOBAL_DEVID].split('#')
      this.deviceType = parts[0]
      this.deviceId = parts[1]
      this.protocolRevision = parts[2]
    }

    if (headers[CoapOptions.STATUS_VALIDITY]) {
      const validity = headers[CoapOptions.STATUS_VALIDITY]
      if ((validity & 0x1) === 0) {
        this.validFor = Math.floor(validity / 10)
      } else {
        this.validFor = validity * 4
      }
    }

    if (headers[CoapOptions.STATUS_SERIAL]) {
      this.serial = headers[CoapOptions.STATUS_SERIAL]
    }

    try {
      this.payload = JSON.parse(msg.payload.toString())
    } catch (e) {
      this.payload = msg.payload.toString()
    }
  }
}

module.exports = CoapMessage
