class Shelly1AddOn {
  constructor(device) {
    this.device = device
  }

  async setExternalSensorTemperatureUnit(fahrenheit) {
    await this.device.request
      .get(`${this.device.host}/settings`)
      .query(
        { ext_sensors_temperature_unit: fahrenheit ? 'F' : 'C' }
      )
  }

  async setExternalTemperatureAct(index, overAct, underAct) {
    await this.device.request
      .get(`${this.device.host}/settings/ext_temperature/${index}`)
      .query(
        {
          overtemp_act: overAct,
          undertemp_act: underAct
        })
  }

  async setExternalTemperatureThreshold(index, overtemp, undertemp) {
    await this.device.request
      .get(`${this.device.host}/settings/ext_temperature/${index}`)
      .query(
        {
          overtemp_threshold_tC: overtemp,
          undertemp_threshold_tC: undertemp
        })
  }

  async setExternalHumidityAct(index, overAct, underAct) {
    await this.device.request
      .get(`${this.device.host}/settings/ext_humidity/${index}`)
      .query(
        {
          overhum_act: overAct,
          underhum_act: underAct
        })
  }

  async setExternalHumidityThreshold(index, overhum, underhum) {
    await this.device.request
      .get(`${this.device.host}/settings/ext_humidity/${index}`)
      .query(
        {
          overhum_threshold: overhum,
          underhum_threshold: underhum
        })
  }
}

module.exports = Shelly1AddOn
