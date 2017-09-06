/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

const Device = require('../lib/device.js');
const Plug = require('../lib/plug.js');

describe('Client', function () {
  this.timeout(5000);
  this.slow(2000);
  let client;
  let invalidDevice;

  beforeEach(function () {
    client = new Hs100Api.Client(config.client);
    invalidDevice = client.getGeneralDevice(config.invalidDevice);
  });

  afterEach(function () {
    client.stopDiscovery();
  });

  describe('#startDiscovery()', function () {
    it('should emit device-new when finding a new device', function (done) {
      client.startDiscovery({ discoveryInterval: 250 }).once('device-new', (device) => {
        device.should.be.an.instanceof(Device);
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-new when finding a new device with a deviceType filter', function (done) {
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'] }).once('device-new', (device) => {
        device.should.be.an.instanceof(Device);
        client.stopDiscovery();
        done();
      });
    });

    it('should NOT emit device-new with an incorrect deviceType filter', function (done) {
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['invalidDeviceType'] }).once('device-new', (device) => {
        client.stopDiscovery();
        try {
          device.should.not.exist;
        } catch (err) {
          done(err);
        }
      });
      setTimeout(done, 1000);
    });

    it('should emit plug-new when finding a new plug', function (done) {
      client.startDiscovery({ discoveryInterval: 250 }).once('plug-new', (device) => {
        device.should.be.an.instanceof(Plug);
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-online when finding an existing device', function (done) {
      client.startDiscovery({ discoveryInterval: 250 }).once('device-online', (device) => {
        device.should.be.an.instanceof(Device);
        client.stopDiscovery();
        done();
      });
    });

    it('should emit plug-online when finding an existing plug', function (done) {
      client.startDiscovery({ discoveryInterval: 250 }).once('plug-online', (device) => {
        device.should.be.an.instanceof(Plug);
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-offline when calling discovery with an offline device', function (done) {
      invalidDevice.status = 'online';
      client.devices.set(invalidDevice.deviceId, invalidDevice);

      client.startDiscovery({ discoveryInterval: 250, offlineTolerance: 1 }).once('device-offline', (device) => {
        device.should.be.an.instanceof(Device);
        done();
      });
    });

    it('should emit plug-offline when calling discovery with an offline plug', function (done) {
      invalidDevice.status = 'online';
      invalidDevice.type = 'plug';
      client.devices.set(invalidDevice.deviceId, invalidDevice);

      client.startDiscovery({ discoveryInterval: 250, offlineTolerance: 1 }).once('plug-offline', (device) => {
        device.should.be.an.instanceof(Device);
        done();
      });
    });

    it('should timeout with timeout set', function (done) {
      this.timeout(1000);
      this.slow(100);
      client.startDiscovery({ discoveryInterval: 0, discoveryTimeout: 1 });
      setTimeout(() => {
        client.discoveryPacketSequence.should.be.above(0);
        should.not.exist(client.discoveryTimer);
        done();
      }, 50);
    });
  });

  describe('#getDevice()', function () {
    this.timeout(2000);
    this.slow(1500);
    let device;

    beforeEach(function (done) {
      client.getDevice(config.plug).then((theDevice) => { device = theDevice; done(); });
    });

    it('should find a device by IP address', function () {
      return device.getSysInfo().should.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return client.getDevice(config.invalidDevice).should.eventually.be.rejected;
    });
  });

  describe('#getPlug()', function () {
    this.timeout(2000);
    this.slow(1500);
    let plug;

    beforeEach(function () {
      plug = client.getPlug(config.plug);
    });

    it('should find a plug by IP address', function () {
      return plug.getSysInfo().should.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      let invalidPlug = client.getPlug(config.invalidDevice);
      return invalidPlug.getSysInfo({timeout: invalidPlug.timeout}).should.eventually.be.rejected;
    });
  });

  describe('#getBulb()', function () {
    it('should find a bulb by IP address', function () {
      this.skip();
    });

    it('should be rejected with an invalid IP address', function () {
      this.skip();
    });
  });

  describe('.send()', function () {
    it('should return info with string payload', function () {
      return client.send({host: config.device.host, port: config.device.port, payload: '{"system":{"get_sysinfo":{}}}', timeout: 1000})
        .should.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
    });
    it('should return info with object payload', function () {
      return client.send({host: config.device.host, port: config.device.port, payload: {'system': {'get_sysinfo': {}}}, timeout: 1000})
        .should.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
    });
  });
});
