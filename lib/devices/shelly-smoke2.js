const ShellySmoke = require('./shelly-smoke')

class ShellySmoke2 extends ShellySmoke {
  constructor(id, host) {
    super(id, host)

    this._defineNumberProperty('humidity')

    this._mapCoapProperties({
      humidity: [3103],
    })

    this._mapMqttTopics({
      humidity: 'sensor/humidity',
    })
  }
}

ShellySmoke2.deviceType = 'SHSM-02'
ShellySmoke2.deviceName = 'Shelly Smoke 2'

module.exports = ShellySmoke2
