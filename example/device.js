const Hs100Api = require('../../hs100-api');

const client = new Hs100Api.Client();
client.getDevice({host: '10.0.0.60'}).then((device) => {
  device.getSysInfo().then(console.log);
});
