const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { getTestClient, testDevices, testDeviceCleanup } = require('./test-device-setup');

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

const testSendOptions = [
  {
    name: 'tcp',
    timeout: 100,
    transport: 'tcp',
    useSharedSocket: false
  },
  {
    name: 'udp',
    timeout: 100,
    transport: 'udp',
    useSharedSocket: false
  },
  {
    name: 'udp-shared',
    timeout: 100,
    transport: 'udp',
    useSharedSocket: true,
    sharedSocketTimeout: 10000
  }
];

module.exports = { expect, sinon, getTestClient, testDevices, testDeviceCleanup, testSendOptions };
