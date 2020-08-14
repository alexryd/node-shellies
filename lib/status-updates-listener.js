const EventEmitter = require('eventemitter3')

const coap = require('./coap')

class StatusUpdatesListener extends EventEmitter {
  constructor() {
    super()

    this._server = null
    this._listening = false
  }

  get listening() {
    return this._listening
  }

  async start(networkInterface = null) {
    if (!this._listening) {
      try {
        this._listening = true

        const handler = msg => {
          // ignore updates without valid device info
          if (msg.deviceType && msg.deviceId) {
            this.emit('statusUpdate', msg)
          }
        }

        await coap.requestStatusUpdates(handler)

        this._server = await coap.listenForStatusUpdates(
          handler,
          networkInterface
        )
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
