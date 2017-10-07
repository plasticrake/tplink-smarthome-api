/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const { getTestClient, testDevices } = require('./setup');
const Device = require('../src/device.js');
const Plug = require('../src/plug.js');
const Bulb = require('../src/bulb.js');

describe('Client', function () {
  this.timeout(5000);
  this.slow(2000);
  let client;

  beforeEach(() => {
    client = getTestClient();
  });

  afterEach(() => {
    client.stopDiscovery();
  });

  describe('#startDiscovery()', function () {
    it('should emit device-new when finding a new device', function (done) {
      client.startDiscovery({ discoveryInterval: 250 }).once('device-new', (device) => {
        expect(device).to.be.an.instanceof(Device);
        client.stopDiscovery();
        done();
      });
    });

    it('should emit device-new when finding a new device with a deviceType filter', function (done) {
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'] }).once('device-new', (device) => {
        expect(device).to.be.an.instanceof(Device);
        client.stopDiscovery();
        done();
      });
    });

    it('should ONLY emit device-new for specified deviceTypes', function (done) {
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'] }).on('device-new', (device) => {
        expect(device.deviceType).to.eql('plug');
      });
      setTimeout(done, 1000);
    });

    it('should NOT emit device-new with an incorrect deviceType filter', function (done) {
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['invalidDeviceType'] }).once('device-new', (device) => {
        client.stopDiscovery();
        expect(device).to.not.exist;
      });
      setTimeout(done, 1000);
    });

    let events = ['new', 'online', 'offline'];
    let eventTests = [];
    [
      {typeName: 'device', type: Device},
      {typeName: 'plug', type: Plug},
      {typeName: 'bulb', type: Bulb}
    ].forEach((t) => {
      events.forEach((e) => {
        eventTests.push(Object.assign({}, t, {event: e}));
      });
    });

    eventTests.forEach((et) => {
      let eventName = `${et.typeName}-${et.event}`;

      it(`should emit ${eventName} when finding a(n) ${et.event} ${et.typeName}`, function (done) {
        if (et.event === 'offline') {
          let invalidDevice = client.getDeviceFromType(et.typeName);
          invalidDevice.status = 'online';
          invalidDevice.sysInfo.type = et.typeName;
          client.devices.set(invalidDevice.deviceId, invalidDevice);
        }

        client.startDiscovery({ discoveryInterval: 250, offlineTolerance: 1 }).once(eventName, (device) => {
          expect(device).to.be.an.instanceof(et.type);
          client.stopDiscovery();
          done();
        });
      });
    });

    it('should timeout with timeout set', function (done) {
      this.timeout(1000);
      this.slow(100);
      client.startDiscovery({ discoveryInterval: 0, discoveryTimeout: 1 });
      setTimeout(() => {
        expect(client.discoveryPacketSequence).to.be.above(0);
        expect(client.discoveryTimer).to.not.exist;
        done();
      }, 50);
    });
  });

  describe('#getDevice()', function () {
    this.timeout(2000);
    this.slow(1500);
    let device;

    before(async function () {
      let client = getTestClient();
      device = await client.getDevice(testDevices['anydevice'].options);
    });

    it('should find a device by IP address', function () {
      return expect(device.getSysInfo()).to.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return expect(client.getDevice(testDevices['unreachable'].options)).to.eventually.be.rejected;
    });
  });

  describe('#getPlug()', function () {
    this.timeout(2000);
    this.slow(1500);
    let plug;
    let unreachablePlug;

    before(function () {
      plug = client.getPlug(testDevices['anyplug'].options);
      unreachablePlug = client.getPlug(testDevices['unreachable'].options);
    });

    it('should find a plug by IP address', function () {
      return expect(plug.getSysInfo()).to.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return expect(unreachablePlug.getSysInfo()).to.eventually.be.rejected;
    });
  });

  describe('#getBulb()', function () {
    this.timeout(2000);
    this.slow(1500);
    let bulb;
    let unreachableBulb;

    before(function () {
      bulb = client.getBulb(testDevices['anybulb'].options);
      unreachableBulb = client.getBulb(testDevices['unreachable'].options);
    });

    it('should find a bulb by IP address', function () {
      return expect(bulb.getSysInfo()).to.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return expect(unreachableBulb.getSysInfo()).to.eventually.be.rejected;
    });
  });

  describe('.send()', function () {
    let options;
    before(function () {
      options = testDevices['anydevice'].options;
    });
    it('should return info with string payload', function () {
      return expect(client.send({host: options.host, port: options.port, payload: '{"system":{"get_sysinfo":{}}}', timeout: 1000}))
        .to.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
    });
    it('should return info with object payload', function () {
      return expect(client.send({host: options.host, port: options.port, payload: {'system': {'get_sysinfo': {}}}, timeout: 1000}))
        .to.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
    });
  });
});
