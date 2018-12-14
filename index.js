const EventEmitter = require('events')

const Coap = require('./lib/coap')
const Device = require('./lib/device')
const request = require('./lib/http-request')
const StatusUpdatesListener = require('./lib/status-updates-listener')

class Shellies extends EventEmitter {
  constructor() {
    super()

    this._devices = new Map()
    this._listener = new StatusUpdatesListener()

    this._listener.on('statusUpdate', this._statusUpdateHandler.bind(this))
  }

  async _statusUpdateHandler(msg) {
    const key = `${msg.deviceType}#${msg.deviceId}`
    const device = this._devices.get(key)

    if (device) {
      device.update(msg)
    } else {
      let device = null

      try {
        device = await Device.createFromStatusMessage(msg)
      } catch (e) {
        this.emit('error', e)
        return
      }

      if (device) {
        this._devices.set(key, device)
        this.emit('device', device)
      } else {
        // silently ignore unknown devices
      }
    }
  }

  async start() {
    await this._listener.start()
  }

  stop() {
    this._listener.stop()
  }

  removeDevice(device) {
    this._devices.delete(`${device.type}#${device.id}`)
  }
}

const shellies = new Shellies()

shellies.Coap = Coap
shellies.createDevice = Device.create.bind(Device)
shellies.request = request
shellies.StatusUpdatesListener = StatusUpdatesListener

module.exports = shellies
