# node-shellies
[![NPM Version](https://img.shields.io/npm/v/shellies.svg)](https://www.npmjs.com/package/shellies)
[![Build Status](https://travis-ci.org/alexryd/node-shellies.svg?branch=master)](https://travis-ci.org/alexryd/node-shellies)

Handles communication with the first generation [Shelly](https://shelly.cloud) devices, using both
[CoAP](http://coap.technology) and HTTP.

For the next generation devices, see [node-shellies-ng](https://github.com/alexryd/node-shellies-ng).

## Features
* Automatically detects Shelly devices (on the same network and subnet).
* Automatically detects when the status of a device changes, such as when a
  relay is turned on or off.
* Keeps track of devices and if they go offline (because no status update has
  been received in a given amount of time).

## Supported devices
The following Shelly devices are supported:
* [Shelly 1](https://shelly.cloud/shelly1-open-source/)
* [Shelly 1L](https://shelly.cloud/products/shelly-1l-single-wire-smart-home-automation-relay/)
* [Shelly 1PM](https://shelly.cloud/shelly-1pm-wifi-smart-relay-home-automation/)
* Shelly 2
* [Shelly 2.5](https://shelly.cloud/shelly-25-wifi-smart-relay-roller-shutter-home-automation/)
* Shelly 2LED
* [Shelly 3EM](https://shelly.cloud/shelly-3-phase-energy-meter-with-contactor-control-wifi-smart-home-automation/)
* [Shelly 4Pro](https://shelly.cloud/shelly-4-pro/)
* [Shelly Air](https://shelly.cloud/products/shelly-air-smart-home-air-purifier/)
* [Shelly Bulb](https://shelly.cloud/shelly-bulb/)
* [Shelly Button 1](https://shelly.cloud/products/shelly-button-1-smart-home-automation-device/)
* Shelly Color
* Shelly Dimmer
* [Shelly Dimmer 2](https://shelly.cloud/products/shelly-dimmer-2-smart-home-light-contoller/)
* Shelly Dimmer W1
* Shelly Door/Window
* [Shelly Door/Window 2](https://shelly.cloud/products/shelly-door-window-2-smart-home-automation-sensor/)
* [Shelly Duo](https://shelly.cloud/wifi-smart-home-automation-shelly-duo/)
* [Shelly EM](https://shelly.cloud/shelly-energy-meter-with-contactor-control-wifi-smart-home-automation/)
* [Shelly Flood](https://shelly.cloud/shelly-flood-and-temperature-sensor-wifi-smart-home-automation/)
* [Shelly Gas](https://shelly.cloud/products/shelly-gas-smart-home-automation-sensor/)
* Shelly HD
* [Shelly H&T](https://shelly.cloud/shelly-humidity-and-temperature/)
* [Shelly i3](https://shelly.cloud/products/shelly-i3-smart-home-automation-device/)
* [Shelly Motion](https://shelly.cloud/shelly-motion-smart-home-automation-sensor/) <sup>1</sup>
* [Shelly Plug](https://shelly.cloud/shelly-plug/)
* [Shelly Plug S](https://shelly.cloud/shelly-plug-s/)
* [Shelly Plug US](https://shelly.cloud/products/shelly-plug-us-smart-home-automation-device/)
* Shelly RGBW
* [Shelly RGBW2](https://shelly.cloud/wifi-smart-shelly-rgbw-2/)
* [Shelly Sense](https://shelly.cloud/shelly-sense/)
* Shelly Smoke
* [Shelly Smoke 2](https://shelly.cloud/products/shelly-smoke-smart-home-automation-sensor/)
* [Shelly TRV](https://shelly.cloud/shelly-thermostatic-radiator-valve/)
* [Shelly Uni](https://shelly.cloud/products/shelly-uni-smart-home-automation-device/)
* [Shelly Vintage](https://shelly.cloud/wifi-smart-home-automation-shelly-vintage/)

### Notes
<sup>1</sup> Requires setting the `Internet & Security -> CoIoT -> Remote
address` option on the Shelly device to the IP address of your device running
node-shellies.

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
