const EventEmitter = require('events')

const {listenForStatusUpdates, requestStatusUpdates} = require('./coap')

class StatusUpdatesListener extends EventEmitter {
  constructor() {
    super()

    this._server = null
    this._lastSeenSerials = new Map()
    this._listening = false
  }

  get listening() {
    return this._listening
  }

  _statusUpdateHandler(msg) {
    if (!msg.deviceType || !msg.deviceId || !msg.serial) {
      return
    }

    const key = `${msg.deviceType}#${msg.deviceId}`

    if (this._lastSeenSerials.get(key) === msg.serial) {
      return
    }

    this._lastSeenSerials.set(key, msg.serial)
    this.emit('statusUpdate', msg)
  }

  async start() {
    if (!this._listening) {
      try {
        this._listening = true

        const handler = this._statusUpdateHandler.bind(this)
        await requestStatusUpdates(handler)

        this._server = await listenForStatusUpdates(handler)
        this.emit('start')
      } catch (e) {
        this._listening = false
        throw e
      }
    }

    return this
  }

  stop() {
    if (this._listening) {
      this._server.close()
      this._server = null
      this._listening = false
      this.emit('stop')
    }

    return this
  }
}

module.exports = StatusUpdatesListener
