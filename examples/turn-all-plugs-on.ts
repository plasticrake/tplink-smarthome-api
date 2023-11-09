import { Client, Plug } from '..'; // 'tplink-smarthome-api'

const client = new Client();

// Search for all plugs and turn them on
client.on('plug-new', (plug: Plug) => {
  console.log('Found plug:', plug.alias);
  plug
    .setPowerState(true)
    .then(() => {
      console.log('Plug', plug.alias, 'is now on');
    })
    .catch((reason) => {
      console.error(reason);
    });
});

client.startDiscovery();
