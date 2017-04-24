const Hs100Api = require('../../hs100-api');

const client = new Hs100Api.Client();
const plug = client.getPlug({host: '10.0.0.60'});
plug.getInfo().then(console.log);
