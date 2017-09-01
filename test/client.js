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
  let client;
  let invalidDevice;

  beforeEach(function () {
    client = new Hs100Api.Client(config.client);
    invalidDevice = client.getGeneralDevice(config.invalidDevice);
  });

  afterEach(function () {
    client.stopDiscovery();
  });

  describe('#startDiscovery', function () {
    it('should emit device-new when finding a new device', function (done) {
      this.timeout(3500);
      this.slow(2000);

      client.startDiscovery({ discoveryInterval: 0 }).once('device-new', (device) => {
        device.should.exist;
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-online when finding an existing device', function (done) {
      this.timeout(3500);
      this.slow(2000);

      client.startDiscovery({ discoveryInterval: 500, discoveryTimeout: 3000 }).once('device-online', (device) => {
        device.should.exist;
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-offline when calling discovery with an offline device', function (done) {
      this.timeout(3500);
      this.slow(2000);

      invalidDevice.status = 'online';
      client.devices.set(invalidDevice.deviceId, invalidDevice);

      client.startDiscovery({ discoveryInterval: 50, discoveryTimeout: 3000, offlineTolerance: 1 }).once('device-offline', (device) => {
        device.should.exist;
        done();
      });
    });
  });

  describe('#getDevice', function () {
    let device;

    beforeEach(function (done) {
      client.getDevice(config.plug).then((theDevice) => { device = theDevice; done(); });
    });

    it('should find a device by IP address', function () {
      this.timeout(2000);
      this.slow(1500);
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
