# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)

TPLink HS100/HS110 WiFi Smart Plug API

## Example
```javascript
var Hs100Api = require('hs100-api');

var hs = new Hs100Api({host: '10.0.1.2'});
hs.setPowerState(true);
hs.getSysInfo().then(console.log);
```

## Thanks
George Georgovassilis & Thomas Baust for reverse engineering the protocol.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html
