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

  describe('#startDiscovery', function () {
    it('should emit device-new when finding a new device', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.startDiscovery(undefined, 0).once('device-new', (device) => {
        device.should.exist;
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-online when finding an existing device', function (done) {
      this.timeout(3500);
      this.slow(3500);

      client.startDiscovery(500, 3000).once('device-online', (device) => {
        device.should.exist;
        client.stopDiscovery();
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
      return device.getSysInfo().should.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      this.timeout(2000);
      this.slow(1500);
      invalidDevice.timeout;
      return invalidDevice.getSysInfo({timeout: 1000}).should.eventually.be.rejected;
    });
  });
});
