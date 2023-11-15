import util from 'util';
import {
  Bulb,
  Client,
  Plug,
  type Device,
  type LightState,
  type RealtimeNormalized,
} from '..'; // 'tplink-smarthome-api'

const client = new Client();

const logEvent = function logEvent(
  eventName: string,
  device: Device,
  state?: unknown,
) {
  const stateString = state != null ? util.inspect(state) : '';
  console.log(
    `${new Date().toISOString()} ${eventName} ${device.model} ${device.host}:${
      device.port
    } ${stateString}`,
  );
};

// Client events `device-*` also have `bulb-*` and `plug-*` counterparts.
// Use those if you want only events for those types and not all devices.
client.on('device-new', (device: Device) => {
  logEvent('device-new', device);

  // Poll device every 5 seconds
  setTimeout(function pollDevice() {
    device
      .getInfo()
      .then((data: unknown) => {
        console.log(data);
        setTimeout(pollDevice, 5000);
      })
      .catch((reason: unknown) => {
        console.error(reason);
      });
  }, 5000);

  // Device (Common) Events
  device.on('emeter-realtime-update', (emeterRealtime: RealtimeNormalized) => {
    logEvent('emeter-realtime-update', device, emeterRealtime);
  });

  if (device instanceof Plug) {
    // Plug Events
    device.on('power-on', () => {
      logEvent('power-on', device);
    });
    device.on('power-off', () => {
      logEvent('power-off', device);
    });
    device.on('power-update', (powerOn: boolean) => {
      logEvent('power-update', device, powerOn);
    });
    device.on('in-use', () => {
      logEvent('in-use', device);
    });
    device.on('not-in-use', () => {
      logEvent('not-in-use', device);
    });
    device.on('in-use-update', (inUse: boolean) => {
      logEvent('in-use-update', device, inUse);
    });
  }

  if (device instanceof Bulb) {
    // Bulb Events
    device.on('lightstate-on', (lightstate: LightState) => {
      logEvent('lightstate-on', device, lightstate);
    });
    device.on('lightstate-off', (lightstate: LightState) => {
      logEvent('lightstate-off', device, lightstate);
    });
    device.on('lightstate-change', (lightstate: LightState) => {
      logEvent('lightstate-change', device, lightstate);
    });
    device.on('lightstate-update', (lightstate: LightState) => {
      logEvent('lightstate-update', device, lightstate);
    });
  }
});

client.on('device-online', (device: Device) => {
  logEvent('device-online', device);
});
client.on('device-offline', (device: Device) => {
  logEvent('device-offline', device);
});

console.log('Starting Device Discovery');
client.startDiscovery();
