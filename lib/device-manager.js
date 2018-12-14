const EventEmitter = require('events')

const Device = require('./device')
const StatusUpdatesListener = require('./status-updates-listener')

class DeviceManager extends EventEmitter {
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

  start() {
    this._listener.start()
  }

  stop() {
    this._listener.stop()
  }

  removeDevice(device) {
    this._devices.delete(`${device.type}#${device.id}`)
  }
}

module.exports = DeviceManager
