const util = require('util');

const { Client } = require('..');
const client = new Client();

var logEvent = function (eventName, device, state) {
  let stateString = (state != null ? util.inspect(state) : '');
  console.log(`${(new Date()).toISOString()} ${eventName} ${device.model} ${device.host}:${device.port} ${stateString}`);
};

// Client events `device-*` also have `bulb-*` and `plug-*` counterparts.
// Use those if you want only events for those types and not all devices.
client.on('device-new', (device) => {
  logEvent('device-new', device);
  device.startPolling(5000);

  // Device (Common) Events
  device.on('emeter-realtime-update', (emeterRealtime) => { logEvent('emeter-realtime-update', device, emeterRealtime); });

  // Plug Events
  device.on('power-on', () => { logEvent('power-on', device); });
  device.on('power-off', () => { logEvent('power-off', device); });
  device.on('power-update', (powerOn) => { logEvent('power-update', device, powerOn); });
  device.on('in-use', () => { logEvent('in-use', device); });
  device.on('not-in-use', () => { logEvent('not-in-use', device); });
  device.on('in-use-update', (inUse) => { logEvent('in-use-update', device, inUse); });

  // Bulb Events
  device.on('lightstate-on', (lightstate) => { logEvent('lightstate-on', device, lightstate); });
  device.on('lightstate-off', (lightstate) => { logEvent('lightstate-off', device, lightstate); });
  device.on('lightstate-change', (lightstate) => { logEvent('lightstate-change', device, lightstate); });
  device.on('lightstate-update', (lightstate) => { logEvent('lightstate-update', device, lightstate); });
});
client.on('device-online', (device) => { logEvent('device-online', device); });
client.on('device-offline', (device) => { logEvent('device-offline', device); });

console.log('Starting Device Discovery');
client.startDiscovery();
