# node-shellies
[![NPM Version](https://img.shields.io/npm/v/shellies.svg)](https://www.npmjs.com/package/shellies)
[![Build Status](https://travis-ci.org/alexryd/node-shellies.svg?branch=master)](https://travis-ci.org/alexryd/node-shellies)

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
* [Shelly 1](https://shelly.cloud/shelly1-open-source/)
* [Shelly 1PM](https://shelly.cloud/shelly-1pm-wifi-smart-relay-home-automation/)
* Shelly 2
* [Shelly 2.5](https://shelly.cloud/shelly-25-wifi-smart-relay-roller-shutter-home-automation/)
* [Shelly 3EM](https://shelly.cloud/shelly-3-phase-energy-meter-with-contactor-control-wifi-smart-home-automation/)
* [Shelly 4Pro](https://shelly.cloud/shelly-4-pro/)
* [Shelly Bulb](https://shelly.cloud/shelly-bulb/)
* [Shelly Dimmer](https://shelly.cloud/wifi-smart-home-automation-shelly-dimmer/)
* [Shelly Door/Window](https://shelly.cloud/wifi-smart-home-automation-door-window-sensor/)
* [Shelly EM](https://shelly.cloud/shelly-energy-meter-with-contactor-control-wifi-smart-home-automation/)
* [Shelly Flood](https://shelly.cloud/shelly-flood-and-temperature-sensor-wifi-smart-home-automation/)
* Shelly HD
* [Shelly H&T](https://shelly.cloud/shelly-humidity-and-temperature/)
* [Shelly Plug](https://shelly.cloud/shelly-plug/)
* [Shelly Plug S](https://shelly.cloud/shelly-plug-s/)
* [Shelly RGBW2](https://shelly.cloud/wifi-smart-shelly-rgbw-2/)
* [Shelly Sense](https://shelly.cloud/shelly-sense/)

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
