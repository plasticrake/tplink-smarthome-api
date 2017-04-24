const Hs100Api = require('../../hs100-api');

const client = new Hs100Api.Client();

var logEvent = function (eventName, plug) {
  console.log(`${(new Date()).toISOString()} ${eventName} ${plug.model} ${plug.host} ${plug.deviceId}`);
};

client.on('plug-new', (plug) => {
  logEvent('plug-new', plug);
  plug.on('power-on', (plug) => { logEvent('power-on', plug); });
  plug.on('power-off', (plug) => { logEvent('power-off', plug); });
  plug.on('in-use', (plug) => { logEvent('in-use', plug); });
  plug.on('not-in-use', (plug) => { logEvent('not-in-use', plug); });
});
client.on('plug-online', (plug) => { logEvent('plug-online', plug); });
client.on('plug-offline', (plug) => { logEvent('plug-offline', plug); });

console.log('Starting Plug Discovery');
client.startDiscovery();
