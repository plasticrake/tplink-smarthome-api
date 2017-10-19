const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { getTestClient, testDevices, testDeviceCleanup } = require('./test-device-setup');

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

module.exports = { expect, sinon, getTestClient, testDevices, testDeviceCleanup };
