# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TPLink HS100/HS110 WiFi Smart Plug API

## Example
```javascript
var Hs100Api = require('hs100-api');

var hs = new Hs100Api({host: '10.0.1.2'});
hs.setPowerState(true);
hs.getSysInfo().then(console.log);
```

## Credits
Thanks to George Georgovassilis and Thomas Baust for reverse engineering the HS1XX protocol.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html
