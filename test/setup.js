/* eslint-env mocha */
'use strict';

const groupBy = require('lodash.groupby');
const defaultTo = require('lodash.defaultto');
const dotenv = require('dotenv');

const simulator = require('tplink-smarthome-simulator');
const Client = require('../src').Client;

dotenv.config();
const clientOptions = { logLevel: process.env.TEST_CLIENT_LOGLEVEL };
const useSimulator = envIsTrue(defaultTo(process.env.TEST_SIMULATOR, true));
const discoveryTimeout = process.env.TEST_DISCOVERY_TIMEOUT || 2000;
const discoveryIpWhitelist = (() => {
  let list = process.env.TEST_DISCOVERY_IP_WHITELIST;
  if (list) return list.split(',');
  return [];
})();

function envIsTrue (value) {
  return !(value == null || value === 0 || value === 'false');
}

function getTestClient (options = {}) {
  return new Client(Object.assign({}, clientOptions, options));
}

async function getTestDevices () {
  if (useSimulator) {
    return getSimulatedTestDevices();
  }
  return getDiscoveryTestDevices();
}

async function getDiscoveryTestDevices () {
  return new Promise((resolve, reject) => {
    let discoveredTestDevices = [];
    let client = getTestClient();
    client.startDiscovery({discoveryTimeout: discoveryTimeout});

    setTimeout(() => {
      client.stopDiscovery();
      for (let device of client.devices.values()) {
        if (discoveryIpWhitelist.length === 0 || discoveryIpWhitelist.includes(device.host)) {
          discoveredTestDevices.push({
            model: device.model,
            options: { host: device.host, port: device.port },
            mac: device.mac,
            getDevice: (options) => client.getDevice(Object.assign({host: device.host, port: device.port}, options))
          });
        } else {
          console.log(`Excluding ${device.host}:${device.port} from test, not in whitelist`);
        }
      }
      return resolve(discoveredTestDevices);
    }, discoveryTimeout);
  });
}

const simulatedDevices = [];
let simulatedUdpServer;

async function getSimulatedTestDevices () {
  let client = getTestClient();

  simulatedDevices.push(new simulator.Device({ model: 'hs100', data: { alias: 'Mock HS100' } }));
  simulatedDevices.push(new simulator.Device({ model: 'hs105', data: { alias: 'Mock HS105' } }));
  simulatedDevices.push(new simulator.Device({ model: 'hs110', data: { alias: 'Mock HS110' } }));
  simulatedDevices.push(new simulator.Device({ model: 'hs200', data: { alias: 'Mock HS200' } }));
  simulatedDevices.push(new simulator.Device({ model: 'lb100', data: { alias: 'Mock LB100' } }));
  simulatedDevices.push(new simulator.Device({ model: 'lb120', data: { alias: 'Mock LB120' } }));
  simulatedDevices.push(new simulator.Device({ model: 'lb130', data: { alias: 'Mock LB130' } }));

  let testDevices = [];
  for (var i = 0; i < simulatedDevices.length; i++) {
    let d = simulatedDevices[i];
    await d.start();
    testDevices.push({
      model: d.model,
      mac: d.data.system.sysinfo.mac,
      options: { host: d.address, port: d.port },
      getDevice: (options) => client.getDevice(Object.assign({host: d.address, port: d.port}, options))
    });
  }

  simulatedUdpServer = await simulator.UdpServer.start();

  return testDevices;
}

function testDeviceCleanup () {
  simulatedDevices.forEach((device) => {
    device.stop();
  });
  if (simulatedUdpServer) {
    simulatedUdpServer.stop();
  }
}

const testDevices = [
  { model: 'hs100', deviceType: 'plug', name: 'HS100(plug)' },
  { model: 'hs105', deviceType: 'plug', name: 'HS105(plug)' },
  { model: 'hs110', deviceType: 'plug', name: 'HS110(plug)' },
  { model: 'hs200', deviceType: 'plug', name: 'HS200(plug)' },
  { model: 'lb100', deviceType: 'bulb', name: 'LB100(bulb)' },
  { model: 'lb120', deviceType: 'bulb', name: 'LB120(bulb)' },
  { model: 'lb130', deviceType: 'bulb', name: 'LB130(bulb)' }];

Object.entries(groupBy(testDevices, 'deviceType')).forEach(([key, value]) => {
  testDevices[key] = value;
});
Object.entries(groupBy(testDevices, 'model')).forEach(([key, value]) => {
  testDevices[key] = value;
});

testDevices['anydevice'] = { name: 'Device', deviceType: 'device' };
testDevices['anyplug'] = { name: 'Plug', deviceType: 'plug' };
testDevices['anybulb'] = { name: 'Bulb', deviceType: 'bulb' };
testDevices['unreachable'] = { name: 'Unreachable Device', options: { host: '192.0.2.0', port: 9999, timeout: 100 } };

(async () => {
  const realTestDevices = await getTestDevices();

  const addDevice = (target, device) => {
    target.mac = device.mac;
    target.options = device.options;
    target.getDevice = device.getDevice;
  };

  testDevices.forEach((testDevice) => {
    let device = realTestDevices.find((realDevice) => (realDevice.model.substr(0, 5).toLowerCase() === testDevice.model));

    if (device) {
      addDevice(testDevice, device);
      if (!testDevices['anydevice'].device) { addDevice(testDevices['anydevice'], device); }
      if (testDevice.deviceType === 'plug' && !testDevices['anyplug'].device) { addDevice(testDevices['anyplug'], device); }
      if (testDevice.deviceType === 'bulb' && !testDevices['anybulb'].device) { addDevice(testDevices['anybulb'], device); }
    }
  });

  testDevices.forEach((td) => {
    let options = td.options || {};
    console.log(td.model, td.deviceType, td.name, options.host, options.port, td.mac);
  });

  ['anydevice', 'anyplug', 'anybulb', 'unreachable'].forEach((key) => {
    let td = testDevices[key];
    let options = td.options || {};
    console.log(key, td.deviceType, td.name, options.host, options.port, td.mac);
  });

  run();
})();

module.exports = {
  getTestClient,
  testDevices,
  testDeviceCleanup
};
