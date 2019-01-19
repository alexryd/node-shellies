# node-shellies
[![NPM Version](https://img.shields.io/npm/v/shellies.svg)](https://www.npmjs.com/package/shellies)

Handles communication with [Shelly](https://shelly.cloud) devices, using both
[CoAP](http://coap.technology) and HTTP.

## Features
* Automatically detects Shelly devices (on the same network and subnet).
* Automatically detects when the status of a device changes, such as when a
  relay is turned on or off.
* Keeps track of devices and if they go offline (because no status update has
  been received in a given amount of time).

## Supported devices
Currently the following Shelly devices are supported:
* [Shelly1](https://shelly.cloud/shelly1-open-source/)
* [Shelly2](https://shelly.cloud/shelly2/)
* [Shelly4Pro](https://shelly.cloud/shelly-4-pro/)

## Basic usage example
```javascript
const shellies = require('shellies')

shellies.on('discover', device => {
  // a new device has been discovered
  console.log('Discovered device with ID', device.id, 'and type', device.type)

  device.on('change', (prop, newValue, oldValue) => {
    // a property on the device has changed
    console.log(prop, 'changed from', oldValue, 'to', newValue)
  })

  device.on('offline', () => {
    // the device went offline
    console.log('Device with ID', device.id, 'went offline')
  })
})

// start discovering devices and listening for status updates
shellies.start()
```
