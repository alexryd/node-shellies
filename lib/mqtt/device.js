
/**
 * Holds information about a Shelly device that has been announced over MQTT.
 */
class MqttDevice {
  /**
   * @param {Object} announcement - The announcement message.
   */
  constructor(announcement) {
    this.type = announcement.model
    this.id = this._getDeviceId(announcement)
    this.macAddress = announcement.mac
    this.update(announcement)
  }

  /**
   * Updates the properties of this device from the given announcement message.
   * @param {Object} announcement - The announcement message.
   */
  update(announcement) {
    this.mqttId = announcement.id
    this.host = announcement.ip
    this.firmwareVersion = announcement.fw_ver
    this.hasNewFirmware = announcement.new_fw
  }

  /**
   * Extracts the device's ID from an announcement message.
   * @param {Object} announcement - The announcement message.
   */
  _getDeviceId(announcement) {
    // try to extract the ID from the MQTT ID
    const m = announcement.id.match(/^shelly.*-([A-Fa-f0-9]{6,12})/i)
    if (m !== null) {
      return m[1].toUpperCase()
    }

    // If that doesn't work (because the device has a custom MQTT ID) we use the
    // MAC address. This is fine for newer devices that use their MAC address as
    // their ID. Older devices however only use the last 6 digits of the MAC
    // address as their ID. Unfortunately there is no way to know whether this
    // is a newer or older device so we'll always use the full MAC address.
    return announcement.mac
  }
}

module.exports = MqttDevice
