const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiSubset = require('chai-subset');

const {
  getTestClient,
  testDevices,
  testDeviceCleanup,
} = require('./test-device-setup');

const { expect } = chai;
chai.use(chaiAsPromised);
chai.use(chaiSubset);
chai.use(sinonChai);

const testSendOptionsSets = [
  {
    name: 'tcp',
    timeout: 100,
    transport: 'tcp',
    useSharedSocket: false,
  },
  {
    name: 'udp',
    timeout: 100,
    transport: 'udp',
    useSharedSocket: false,
  },
  {
    name: 'udp-shared',
    timeout: 100,
    transport: 'udp',
    useSharedSocket: true,
    sharedSocketTimeout: 10000,
  },
];

module.exports = {
  expect,
  sinon,
  getTestClient,
  testDevices,
  testDeviceCleanup,
  testSendOptionsSets,
};
