import { Client } from '..'; // 'tplink-smarthome-api'

const client = new Client();

client
  .getDevice({ host: '10.0.0.60' })
  .then(async (device) => {
    const sysInfo = await device.getSysInfo();
    console.log(sysInfo);
  })
  .catch((reason) => {
    console.error(reason);
  });
