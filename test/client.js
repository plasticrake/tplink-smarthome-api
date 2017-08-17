/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Client', function () {
  var client;
  var device;
  var invalidDevice;

  beforeEach(function () {
    client = new Hs100Api.Client(config.client);
    device = client.getDevice(config.plug);
    invalidDevice = client.getDevice(config.invalidDevice);
  });

  afterEach(function () {
    client.stopDiscovery();
  });

  describe('#sendDiscovery', function () {
    it('should emit device-new when finding a new device', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.sendDiscovery().once('device-new', (device) => {
        device.should.exist;
        done();
      });
    });

    it('should emit device-online when finding an existing device', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.sendDiscovery();
      client.sendDiscovery().once('device-online', (device) => {
        device.should.exist;
        done();
      });
    });

    it('should emit device-offline when calling discovery with an offline device', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.discoveryInterval = '50';
      client.offlineTolerance = 2;

      invalidDevice.status = 'online';
      client.devices.set(invalidDevice.deviceId, invalidDevice);

      client.startDiscovery().once('device-offline', (device) => {
        device.should.exist;
        done();
      });
    });
  });

  describe('#getDevice', function () {
    it('should find a device by IP address', function () {
      return device.getInfo().should.eventually.have.property('sysInfo');
    });

    it('should be rejected with an invalid IP address', function () {
      this.timeout(1500);
      return invalidDevice.getInfo().should.eventually.be.rejected;
    });
  });
});
