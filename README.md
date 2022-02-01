<!-- markdownlint-disable MD007 MD012 MD033 -->

# tplink-smarthome-api

[![NPM Version](https://img.shields.io/npm/v/tplink-smarthome-api.svg)](https://www.npmjs.com/package/tplink-smarthome-api)
[![Build Status](https://github.com/plasticrake/tplink-smarthome-api/workflows/CI/badge.svg?branch=master)](https://github.com/plasticrake/tplink-smarthome-api/actions?query=workflow%3ACI+branch%3Amaster)
[![codecov](https://codecov.io/gh/plasticrake/tplink-smarthome-api/branch/master/graph/badge.svg)](https://codecov.io/gh/plasticrake/tplink-smarthome-api)

TP-Link Smarthome API

**[Changelog](https://github.com/plasticrake/tplink-smarthome-api/tree/master/CHANGELOG.md)**

## Known Supported Devices

| Model                                                                                                    | Type               |
| -------------------------------------------------------------------------------------------------------- | ------------------ |
| HS100, HS103, HS105, HS107, HS110,<br/>HS200, HS210, HS220, HS300, KP303, KP400<br/>ES20M, EP40, ...etc. | Plug               |
| LB100, LB110, LB120, LB130, LB200, LB230, KL50, KL120, KL125<br/>...etc.                                 | Bulb               |
| KL430<br/>...etc.                                                                                        | Bulb (light strip) |

Many other TP-Link Plug and Bulb models may work as well. Note that Tapo devices are not supported.

## Related Projects

- [TP-Link Smarthome Device Simulator](https://github.com/plasticrake/tplink-smarthome-simulator) - Useful for automated testing
- [TP-Link Smarthome Crypto](https://github.com/plasticrake/tplink-smarthome-crypto)
- [TP-Link Smarthome Homebridge Plugin](https://github.com/plasticrake/homebridge-tplink-smarthome)

## Examples

See more [examples](https://github.com/plasticrake/tplink-smarthome-api/tree/master/examples).

```javascript
const { Client } = require('tplink-smarthome-api');

const client = new Client();
const plug = client.getDevice({ host: '10.0.1.2' }).then((device) => {
  device.getSysInfo().then(console.log);
  device.setPowerState(true);
});

// Look for devices, log to console, and turn them on
client.startDiscovery().on('device-new', (device) => {
  device.getSysInfo().then(console.log);
  device.setPowerState(true);
});
```

## CLI

Install the command line utility with `npm install -g tplink-smarthome-api`. Run `tplink-smarthome-api --help` for help.

## API

[API docs can be found here.](https://plasticrake.github.io/tplink-smarthome-api/)

For functions that send commands, the last argument is `SendOptions` where you can set the `transport` ('tcp','udp') and `timeout`, etc.

Functions that take more than 3 arguments are passed a single options object as the first argument (and if its a network command, SendOptions as the second.)

## Credits

Thanks to George Georgovassilis and Thomas Baust for [figuring out the HS1XX encryption](https://blog.georgovassilis.com/2016/05/07/controlling-the-tp-link-hs100-wi-fi-smart-plug/).

Some design cues for Client based on [node-lifx](https://github.com/MariusRumpf/node-lifx/)
