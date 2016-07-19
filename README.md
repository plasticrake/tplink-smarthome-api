# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TPLink HS100/HS110 WiFi Smart Plug API



## Example
```javascript
var Hs100Api = require('hs100-api');

var hs = new Hs100Api({host: '10.0.1.2'});
hs.setPowerState(true);
hs.getInfo().then(console.log);
```

## API
The API is currently not stable and there may be breaking changes. All functions return a promise.
##### search (timeout = 3000, maxSearchCount = 0)
Sends out a broadcast and waits for plugs to respond until the until the timeout is reached. If maxSearchCount is > 0 then stop waiting (return early) after that number of plugs respond. Returns an array of data matching getInfo for each plug.
##### getInfo
Get general plug info.
##### getPowerState
Returns true if plug is on.
##### setPowerState(value)
Turns the plug on or off.
##### getConsumption
Get power consumption data for HS110 plugs.
##### getCloudInfo
Get TP-Link Cloud information.
##### getScheduleNextAction
##### getScheduleRules
##### getAwayRules
##### getTimerRules
##### getTime
##### getTimeZone
##### getScanInfo
Get list of networks from last scan.
##### getModel


## Credits
Thanks to George Georgovassilis and Thomas Baust for figuring out the HS1XX encryption.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html
