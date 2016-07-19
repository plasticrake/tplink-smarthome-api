# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TPLink HS100/HS110 WiFi Smart Plug API

## Example
```javascript
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const plug = client.getPlug({host: '10.0.1.2'});
plug.setPowerState(true);
plug.getInfo().then(console.log);

// Look for plugs, log to console, and turn them on
client.search().then((plugInfoArray) => {
  plugInfoArray.forEach((plugInfo) => {
    console.log(plugInfo);
    client.getPlug(plugInfo).setPowerState(true);
  })
})
```

## API
The API is currently not stable and there may be breaking changes. All functions return a promise unless indicated.

### Client

#### new Client(options)
Returns a Client object. ***Not a promise.***
```javascript
options: { [broadcast = '255.255.255.255'] }
```

#### getPlug(options)
Returns a Plug object. ***Not a promise.***
```javascript
options: { host [, port = 9999] }
```

#### search( [timeout = 3000] [, maxSearchCount = 0] )
Sends out a broadcast and waits for plugs to respond until the until the timeout is reached. If maxSearchCount is > 0 then stop waiting (return early) after that number of plugs respond. Returns an array of data matching getInfo for each plug plus host and port.

### Plug
#### getInfo
Get general plug info.
#### getPowerState
Returns true if plug is on.
#### setPowerState(value)
Turns the plug on or off.
#### getConsumption
Get power consumption data for HS110 plugs.
#### getCloudInfo
Get TP-Link Cloud information.
#### getScheduleNextAction
#### getScheduleRules
#### getAwayRules
#### getTimerRules
#### getTime
#### getTimeZone
#### getScanInfo
Get list of networks from last scan.
#### getModel


## Credits
Thanks to George Georgovassilis and Thomas Baust for figuring out the HS1XX encryption.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html
