/* eslint-env mocha */
/* global testDevices */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const Device = require('../src/device');

function deviceIsOk (testDevice) {
  it(`should have a device`, function () {
    expect(testDevice.device).to.exist.and.be.an.instanceof(Device);
  });
  it(`should have options`, function () {
    expect(testDevice.options).to.exist.and.to.contain.keys('host', 'port');
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

  context('unreachable', function () {
    it(`should have options`, function () {
      expect(testDevices['unreachable'].options).to.contain.keys('host', 'port');
    });
  });
});
