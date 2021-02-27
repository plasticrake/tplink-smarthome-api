import { Client } from '..'; // 'tplink-smarthome-api'

const client = new Client();

client.getDevice({ host: '10.0.0.60' }).then((device) => {
  console.log('Found device:', device.deviceType, device.alias);
  if (device.deviceType === 'plug') {
    console.log('Turning plug on, then off', device.alias);
    device.setPowerState(true);
    device.setPowerState(false);
  }
});
