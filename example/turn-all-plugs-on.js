const Hs100Api = require('..');
const client = new Hs100Api.Client();

// Search for all plugs and turn them on
client.on('plug-new', function (plug) {
  console.log('Found plug:', plug.alias);
  plug.setPowerState(true).then(function () {
    console.log('Plug', plug.alias, 'is now on');
  });
});
client.startDiscovery();
