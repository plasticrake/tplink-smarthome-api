import { Client } from '..'; // 'tplink-smarthome-api'

const client = new Client();

client
  .getDevice({ host: '10.0.0.60' })
  .then(async (device) => {
    console.log('Found device:', device.deviceType, device.alias);
    if (device.deviceType === 'plug') {
      console.log('Turning plug on, then off', device.alias);
      await device.setPowerState(true);
      await device.setPowerState(false);
    }
  })
  .catch((reason) => {
    console.error(reason);
  });
