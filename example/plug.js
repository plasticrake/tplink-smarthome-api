const Hs100Api = require('../../hs100-api');

const client = new Hs100Api.Client();
const device = client.getDevice({host: '10.0.0.60'});
device.getInfo().then(console.log);
