const Hs100Api = require('../../hs100-api');

const client = new Hs100Api.Client();

var logEvent = function (eventName, device) {
  console.log(`${(new Date()).toISOString()} ${eventName} ${device.model} ${device.host} ${device.deviceId}`);
};

client.on('device-new', (device) => {
  logEvent('device-new', device);
  device.startPolling(5000);

  device.on('power-on', (device) => { logEvent('power-on', device); });
  device.on('power-off', (device) => { logEvent('power-off', device); });
  device.on('power-update', (device, powerOn) => { logEvent('power-update', device); });

  device.on('in-use', (device) => { logEvent('in-use', device); });
  device.on('not-in-use', (device) => { logEvent('not-in-use', device); });
  device.on('in-use-update', (device, inUse) => { logEvent('in-use-update', device); });

  device.on('consumption-update', (device, consumption) => { logEvent('consumption-update', device); });
});
client.on('device-online', (device) => { logEvent('device-online', device); });
client.on('device-offline', (device) => { logEvent('device-offline', device); });

console.log('Starting Device Discovery');
client.startDiscovery();
