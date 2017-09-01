# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TPLink Smart Home API

## Supported Devices

| Model | Type | deviceType | Support |
|-------|------|------------|---------|
| HS100, HS105, HS110 | Plug | IOT.SMARTPLUGSWITCH | Good |
| HS200 | Switch | | Not tested, Reported as working as a Plug |
| LB100, LB110, LB120 | Bulb | IOT.SMARTBULB | Not tested |

I only have HS100, HS105 and HS110 (plugs), so Switch and Bulb support is difficult for me to test. I'd gladly accept pull requests to add features or equipment donations ([amazon wishlist](http://a.co/bw0EfsB)) so I can do my own development!

## Example
```javascript
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const plug = client.getDevice({host: '10.0.1.2'}).then((device)=>{
  device.getInfo().then(console.log);
  device.setPowerState(true);
});

// Look for devices, log to console, and turn them on
client.startDiscovery().on('device-new', (device) => {
  device.getInfo().then(console.log);
  device.setPowerState(true);
});
```

## API
The API is not stable and there may be breaking changes.

### Client

#### `new Client({debug = false})`
Returns a Client object.

#### `startDiscovery(options)`
```javascript
options: {
  [address] // address to bind socket, bind to all if not specified
  [, port] // port to bind socket, random if not specified
  [, broadcast = '255.255.255.255']
  [, discoveryInterval = 10000]
  [, discoveryTimeout = 0]
  [, offlineTolerance = 3]
  [, deviceTypes]
  [, devices]
}
```
Sends a discovery packet to the `broadcast` address every `discoveryInterval`(ms). Stops discovery after `discoveryTimeout`(ms) if greater than 0. If `deviceTypes` is specified only matching devices are found. Returns Client that emits `device-new` when a response from a new device is received and `device-online` for known devices. If a known device has not been heard from after `offlineTolerance` number of discovery attempts then emits `device-offline`. If `devices` is specified it will attempt to contact them directly in addition to sending to the broadcast address. `devices` are an array of `[{host, [port: 9999]}]`.

#### `stopDiscovery()`
Stops discovery process.

#### `getDevice({host, port = 9999, timeout = 3000})` _(promise)_
Returns a specific Device object (Plug or Bulb) after querying the device to determine the type.

#### `getGeneralDevice({host, port = 9999, timeout = 3000})`
Returns a generic TP Link Device object.
```javascript
options: { host [, port = 9999] [, timeout = 0] }
```

#### `getPlug({host, port = 9999, timeout = 3000})`
Returns a Plug object.
```javascript
options: { host [, port = 9999] [, timeout = 0] [, inUseThreshold = 0] }
```

#### `getBulb({host, port = 9999, timeout = 3000})`
Returns a Bulb object.
```javascript
options: { host [, port = 9999] [, timeout = 0] }
```

### Device

#### `static send ({host, port = 9999, payload, timeout = 3000})` _(promise)_
Send `payload` to device. Promise resolves to parsed JSON response.

#### `send(payload, timeout = 0)` _(promise)_
Send `payload` to device. Promise resolves to parsed JSON response.

#### `startPolling(interval)`
Polls the device every `interval`. Returns device that emits events based on state changes. Refer to specific device sections below for details.


#### `getSysInfo({timeout} = {})` _(promise)_
Get general info.

#### `sysInfo`
Returns cached data from last `getSysInfo()`.

#### `getModel()` _(promise)_
Get device model.


### Plug
Derives from Device and includes Device functions above.

#### `startPolling(interval)`
Polls the device every `interval`. Returns device that emits events based on state changes. Emits `power-on`/`power-off` based on the relay state and `in-use`/`not-in-use` when the device is drawing more than power than the `inUseThreshold` if it supports power monitoring. These events are emitted during any query of the device, not only when using `startPolling`.

#### `getInfo()` _(promise)_
Get all device info. Same as calling getSysInfo, getCloudInfo, getConsumption, getScheduleNextAction.

#### `getCloudInfo()` _(promise)_
Get TP-Link Cloud information.
#### `getConsumption()` _(promise)_
Get power consumption data for HS110 plugs and devices that support it.
#### `getPowerState()` _(promise)_
Returns true if device is on.
#### `setPowerState(value)` _(promise)_
Turns the device on or off.
#### `getLedState()` _(promise)_
#### `setLedState()` _(promise)_
#### `getScheduleNextAction()` _(promise)_
#### `getScheduleRules()` _(promise)_
#### `getAwayRules()` _(promise)_
#### `getTimerRules()` _(promise)_
#### `getTime()` _(promise)_
#### `getTimeZone()` _(promise)_
#### `getScanInfo([refresh = false] [, timeout = 17])` _(promise)_
Get list of networks.

### Bulb
Derives from Device and includes Device functions above.
#### `getInfo()` _(promise)_
#### `getLightState()` _(promise)_
#### `setLightState()` _(promise)_
#### `getPowerState()` _(promise)_
#### `setPowerState(value)` _(promise)_
#### `getScheduleRules()` _(promise)_
#### `getCloudInfo()` _(promise)_
Get TP-Link Cloud information.

## Credits
Thanks to George Georgovassilis and Thomas Baust for figuring out the HS1XX encryption.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html

Some design cues for Client based on https://github.com/MariusRumpf/node-lifx/
