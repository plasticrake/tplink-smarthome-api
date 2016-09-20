# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TPLink HS100/HS110 WiFi Smart Plug API

## Example
```javascript
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const plug = client.getPlug({host: '10.0.1.2'});
plug.getInfo().then(console.log);
plug.setPowerState(true);

// Look for plugs, log to console, and turn them on
client.startDiscovery().on('plug-new', (plug) => {
  plug.getInfo().then(console.log);
  plug.setPowerState(true);
});
```

## API
The API is currently not stable and there may be breaking changes.

### Client

#### new Client(options)
Returns a Client object.
```javascript
options: {
  [address]
  [, port]
  [, broadcast = '255.255.255.255']
  [, discoveryInterval = 30000]
  [, offlineTolerance = 3]
  [, debug = false]
}
```

#### startDiscovery([plugs])
Sends a discovery packet to the broadcast address every `discoveryInterval`. An array of addresses can be specified to query directly. Emits `plug-new` when a response from a new plug is received and `plug-online` for known plugs. If a known plug has not been heard from after `offlineTolerance` number of discovery attempts then emits `plug-offline`.

#### stopDiscovery
Stops discovery process.

#### getPlug(options)
Returns a Plug object.
```javascript
options: { host [, port = 9999] [, timeout = 0] }
```

### Plug
#### getInfo _(promise)_
Get all plug info. Same as calling all of getSysInfo, getCloudInfo, getConsumption, getScheduleNextAction.
#### getSysInfo _(promise)_
Get general plug info.
#### getCloudInfo _(promise)_
Get TP-Link Cloud information.
#### getConsumption _(promise)_
Get power consumption data for HS110 plugs.
#### getPowerState _(promise)_
Returns true if plug is on.
#### setPowerState(value) _(promise)_
Turns the plug on or off.
#### getScheduleNextAction _(promise)_
#### getScheduleRules _(promise)_
#### getAwayRules _(promise)_
#### getTimerRules _(promise)_
#### getTime _(promise)_
#### getTimeZone _(promise)_
#### getScanInfo([refresh = false] [, timeout = 17]) _(promise)_
Get list of networks.
#### getModel _(promise)_


## Credits
Thanks to George Georgovassilis and Thomas Baust for figuring out the HS1XX encryption.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html

Some design cues for Client were based on https://github.com/MariusRumpf/node-lifx/
