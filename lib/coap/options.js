const coap = require('coap')

const CoapOptions = {
  GLOBAL_DEVID: '3332',
  STATUS_VALIDITY: '3412',
  STATUS_SERIAL: '3420',

  register() {
    coap.registerOption(
      this.GLOBAL_DEVID,
      str => Buffer.from(str),
      buf => buf.toString()
    )

    coap.registerOption(
      this.STATUS_VALIDITY,
      str => Buffer.alloc(2).writeUInt16BE(parseInt(str), 0),
      buf => buf.readUInt16BE(0)
    )

    coap.registerOption(
      this.STATUS_SERIAL,
      str => Buffer.alloc(2).writeUInt16BE(parseInt(str), 0),
      buf => buf.readUInt16BE(0)
    )
  },
}

module.exports = CoapOptions
