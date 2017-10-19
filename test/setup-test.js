/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, getTestClient, testDevices, testDeviceCleanup } = require('./setup');

const Client = require('../src/client');
const Device = require('../src/device');

after(function () {
  testDeviceCleanup();
});

describe('Test Environment Setup', function () {
  describe('getTestClient()', function () {
    it(`should return Client`, function () {
      let client = getTestClient();
      expect(client).to.be.instanceOf(Client);
    });
  });

  function deviceIsOk (testDevice) {
    it(`should have a device`, function () {
      expect(testDevice.getDevice).to.exist.and.be.an.instanceof(Function);
      return expect(testDevice.getDevice()).to.eventually.exist.and.be.an.instanceof(Device);
    });
    it(`should have deviceOptions`, function () {
      expect(testDevice.deviceOptions).to.exist.and.to.contain.keys('host', 'port');
    });
  }

  describe('testDevices', function () {
    testDevices.forEach((testDevice) => {
      context(testDevice.model, function () {
        deviceIsOk(testDevice);
      });
    });

    ['anydevice', 'anyplug', 'anybulb'].forEach((deviceKey) => {
      context(deviceKey, function () {
        deviceIsOk(testDevices[deviceKey]);
      });
    });

    context('unreliable', function () {
      let testDevice;
      before(function () {
        testDevice = testDevices['unreliable'];
      });
      it(`should have deviceOptions`, function () {
        expect(testDevice).to.have.property('deviceOptions');
        expect(testDevice.deviceOptions).to.contain.keys('host', 'port');
      });
      it(`should have getDevice and throw`, function () {
        expect(testDevice.getDevice).to.exist.and.be.an.instanceof(Function);
        return expect(testDevice.getDevice()).to.eventually.be.rejected;
      });
    });

    context('unreachable', function () {
      it(`should have deviceOptions`, function () {
        expect(testDevices['unreachable']).to.have.property('deviceOptions');
        expect(testDevices['unreachable'].deviceOptions).to.contain.keys('host', 'port');
      });
    });
  });
});
