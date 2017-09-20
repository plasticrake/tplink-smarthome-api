/* eslint-env mocha */
'use strict';

const groupBy = require('lodash.groupby');
require('dotenv').config();

const Client = require('../src').Client;

const clientOptions = { logLevel: process.env.TEST_CLIENT_LOGLEVEL };

function getTestClient () {
  let client = new Client(clientOptions);
  return client;
}

async function getTestDevices () {
  let testDevices;
  if (process.env.TEST_DISCOVERY != null && !process.env.TEST_DISCOVERY) {
    testDevices = getStaticTestDevices();
  } else {
    testDevices = await getDynamicTestDevices();
  }
  return Promise.resolve(testDevices);
}

function getStaticTestDevices () {
  let client = getTestClient();

  let staticTestDevices = [];

  [{type: 'plug', host: process.env.TEST_PLUG_HOST},
  {type: 'bulb', host: process.env.TEST_BULB_HOST}].forEach((o) => {
    if (o.host) {
      let [host, port] = o.host.split(':');
      staticTestDevices.push(client.getDeviceFromType(o.type, {host, port}));
    }
  });
  return staticTestDevices;
}

async function getDynamicTestDevices () {
  return new Promise((resolve, reject) => {
    let dynamicTestDevices = [];
    let discoveryTimeout = process.env.TEST_DISCOVERY_TIMEOUT || 2000;
    let client = getTestClient();
    client.startDiscovery({discoveryTimeout: discoveryTimeout});

    let deviceWhitelist = process.env.TEST_DEVICE_IP_WHITELIST || [];
    if (deviceWhitelist) {
      deviceWhitelist = deviceWhitelist.split(',');
    }

    setTimeout(() => {
      client.stopDiscovery();
      for (let device of client.devices.values()) {
        if (deviceWhitelist.length === 0 || deviceWhitelist.includes(device.host)) {
          dynamicTestDevices.push(device);
        } else {
          // console.log(`Excluding ${device.host} from test`);
        }
      }
      return resolve(dynamicTestDevices);
    }, discoveryTimeout);
  });
}

global.getTestClient = getTestClient;

global.testDevices = [
  { model: 'hs100', type: 'plug', name: 'HS100(plug)' },
  { model: 'hs105', type: 'plug', name: 'HS105(plug)' },
  { model: 'hs110', type: 'plug', name: 'HS110(plug)' },
  { model: 'hs200', type: 'plug', name: 'HS200(plug)' },
  { model: 'lb100', type: 'bulb', name: 'LB100(bulb)' },
  { model: 'lb120', type: 'bulb', name: 'LB120(bulb)' },
  { model: 'lb130', type: 'bulb', name: 'LB130(bulb)' }];

Object.entries(groupBy(global.testDevices, 'type')).forEach(([key, value]) => {
  global.testDevices[key] = value;
});
Object.entries(groupBy(global.testDevices, 'model')).forEach(([key, value]) => {
  global.testDevices[key] = value;
});

global.testDevices['anyplug'] = { name: 'Plug' };
global.testDevices['anybulb'] = { name: 'Bulb' };
global.testDevices['anydevice'] = { name: 'Device' };
global.testDevices['unreachable'] = { name: 'Unreachable Device', options: { host: '192.0.2.0', port: 9999, timeout: 100 } };

(async () => {
  const realTestDevices = await getTestDevices();

  let testDevices = global.testDevices;

  const addDevice = (target, device) => {
    target.device = device;
    target.options = { host: device.host, port: device.port };
  };

  testDevices.forEach((testDevice) => {
    let device = realTestDevices.find((realDevice) => (realDevice.model.substr(0, 5).toLowerCase() === testDevice.model));

    if (device) {
      addDevice(testDevice, device);
      if (!testDevices['anydevice'].device) { addDevice(testDevices['anydevice'], device); }
      if (testDevice.type === 'plug' && !testDevices['anyplug'].device) { addDevice(testDevices['anyplug'], device); }
      if (testDevice.type === 'bulb' && !testDevices['anybulb'].device) { addDevice(testDevices['anybulb'], device); }
    }
  });

  run();
})();
