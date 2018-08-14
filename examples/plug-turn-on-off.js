const { Client } = require('..');
const client = new Client();

let plug = client.getPlug({host: '10.0.0.60'});
plug.setPowerState(true);
plug.setPowerState(false);
