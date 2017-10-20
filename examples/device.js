const { Client } = require('..');
const client = new Client();

client.getDevice({host: '10.0.0.60'}).then((device) => {
  device.getSysInfo().then(console.log);
});
