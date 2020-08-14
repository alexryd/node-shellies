const UnknownDevice = require('./unknown')

// require all device classes
const deviceClasses = require('require-all')({
  dirname: __dirname,
  filter: fileName => {
    if (fileName === 'base.js' || fileName === 'index.js' ||
      fileName === 'unknown.js') {
      return false
    }
    return fileName
  },
  recursive: false,
})

// construct a map of CoAP type identifiers to device classes
const deviceTypeToClass = new Map()

for (const DeviceClass of Object.values(deviceClasses)) {
  deviceTypeToClass.set(
    DeviceClass.deviceType,
    DeviceClass
  )
}

module.exports = {
  /**
   * Creates a new device of the given type.
   *
   * @param {string} type - CoAP device type identifier.
   * @param {string} id - The device ID.
   * @param {string} host - The hostname of the device.
   * @param {string} mode - The intial device mode.
   */
  create: (type, id, host, mode = undefined) => {
    const DeviceClass = deviceTypeToClass.get(type)
    if (DeviceClass) {
      return new DeviceClass(id, host, mode)
    } else {
      return new UnknownDevice(id, host, type)
    }
  },

  /**
   * Returns true if the given device is of an unknown type; false otherwise.
   */
  isUnknown: device => {
    return device instanceof UnknownDevice
  },
}
