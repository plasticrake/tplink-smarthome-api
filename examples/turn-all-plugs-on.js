const { Client } = require('tplink-smarthome-api');

const client = new Client();

// Search for all plugs and turn them on
client.on('plug-new', plug => {
  console.log('Found plug:', plug.alias);
  plug.setPowerState(true).then(() => {
    console.log('Plug', plug.alias, 'is now on');
  });
});
client.startDiscovery();
