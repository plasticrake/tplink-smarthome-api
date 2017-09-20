/* eslint-env mocha */
'use strict';

const groupBy = require('lodash.groupby');
const defaultTo = require('lodash.defaultto');
require('dotenv').config();

const Client = require('../src').Client;

const clientOptions = { logLevel: process.env.TEST_CLIENT_LOGLEVEL };

function getTestClient () {
  let client = new Client(clientOptions);
  return client;
}

async function getTestDevices () {
  let testDiscovery = defaultTo(process.env.TEST_DISCOVERY, true);
  if (testDiscovery === 0 || testDiscovery === 'false') {
    return getStaticTestDevices();
  } else {
    return getDynamicTestDevices();
  }
}

async function getStaticTestDevices () {
  let client = getTestClient();
  let staticTestDevices = [];
  let hosts = [
    process.env.TEST_HS100_HOST,
    process.env.TEST_HS105_HOST,
    process.env.TEST_HS110_HOST];

  for (var i = 0; i < hosts.length; i++) {
    if (hosts[i]) {
      let [host, port] = hosts[i].split(':');
      staticTestDevices.push(client.getDevice({host, port}));
    }
  }
  return Promise.all(staticTestDevices);
}

async function getDynamicTestDevices () {
  return new Promise((resolve, reject) => {
    let dynamicTestDevices = [];
    let discoveryTimeout = process.env.TEST_DISCOVERY_TIMEOUT || 2000;
    let client = getTestClient();
    client.startDiscovery({discoveryTimeout: discoveryTimeout});

    let deviceWhitelist = process.env.TEST_DISCOVERY_IP_WHITELIST || [];
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

global.testDevices['anydevice'] = { name: 'Device', type: 'device' };
global.testDevices['anyplug'] = { name: 'Plug', type: 'plug' };
global.testDevices['anybulb'] = { name: 'Bulb', type: 'bulb' };
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

  global.testDevices.forEach((td) => {
    let device = td.device || {};
    console.log(td.model, td.type, td.name, device.host, device.port);
  });

  ['anydevice', 'anyplug', 'anybulb', 'unreachable'].forEach((key) => {
    let td = global.testDevices[key];
    let device = td.device || {};
    console.log(key, td.type, td.name, device.host, device.port);
  });

  run();
})();
