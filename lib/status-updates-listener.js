const EventEmitter = require('events')

const {listenForStatusUpdates, requestStatusUpdates} = require('./coap')

class StatusUpdatesListener extends EventEmitter {
  constructor() {
    super()

    this._server = null
    this._listening = false
  }

  get listening() {
    return this._listening
  }

  async start() {
    if (!this._listening) {
      try {
        this._listening = true

        const handler = msg => this.emit('statusUpdate', msg)

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
