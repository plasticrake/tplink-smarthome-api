/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, sinon, getTestClient, testDevices } = require('./setup');

const Device = require('../src/device');
const Plug = require('../src/plug');
const Bulb = require('../src/bulb');

describe('Client', function () {
  this.timeout(5000);
  this.slow(2000);

  describe('#startDiscovery()', function () {
    let client;
    beforeEach(function () {
      client = getTestClient({ logLevel: 'silent' });
    });

    afterEach(function () {
      client.stopDiscovery();
    });

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

    it('should ONLY emit device-new for specified macAddresses', function (done) {
      let spy = sinon.spy();
      let mac = testDevices['anydevice'].mac;
      expect(mac).to.be.a('string').and.not.empty;

      client.startDiscovery({ discoveryInterval: 250, macAddresses: [mac] }).on('device-new', spy);

      setTimeout(() => {
        expect(spy, `MAC:[${mac}] not found`).to.be.called;
        expect(spy).to.always.be.calledWithMatch({mac: mac});
        done();
      }, 1000);
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
          invalidDevice.seenOnDiscovery = 0;
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

    it('should emit discovery-invalid for the unreliable test device', function (done) {
      let device = testDevices['unreliable'];
      if (!device.deviceOptions || !device.deviceOptions.port) this.skip();

      client.startDiscovery({ discoveryInterval: 250 }).on('discovery-invalid', ({rinfo, response, decryptedResponse}) => {
        expect(response).to.be.instanceof(Buffer);
        expect(decryptedResponse).to.be.instanceof(Buffer);

        if (rinfo.port === device.deviceOptions.port) {
          client.stopDiscovery();
          done();
        }
      });
    });
  });

  describe('#getDevice()', function () {
    this.timeout(2000);
    this.slow(1500);
    let client;
    let device;

    before(async function () {
      client = getTestClient();
      device = await client.getDevice(testDevices['anydevice'].deviceOptions);
    });

    it('should find a device by IP address', function () {
      return expect(device.getSysInfo()).to.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', async function () {
      let error;
      let deviceOptions = testDevices['unreachable'].deviceOptions;
      try {
        await client.getDevice(deviceOptions, { timeout: 500 });
      } catch (err) {
        error = err;
      }
      expect(error).to.be.instanceOf(Error);
    });
  });

  describe('#getPlug()', function () {
    this.timeout(2000);
    this.slow(1500);
    let client;
    let plug;
    let unreachablePlug;

    before(function () {
      client = getTestClient();
      plug = client.getPlug(testDevices['anyplug'].deviceOptions);
      unreachablePlug = client.getPlug(testDevices['unreachable'].deviceOptions);
    });

    it('should find a plug by IP address', function () {
      return expect(plug.getSysInfo()).to.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return expect(unreachablePlug.getSysInfo({ timeout: 500 })).to.eventually.be.rejected;
    });
  });

  describe('#getBulb()', function () {
    this.timeout(2000);
    this.slow(1500);
    let client;
    let bulb;
    let unreachableBulb;

    before(function () {
      client = getTestClient();
      bulb = client.getBulb(testDevices['anybulb'].deviceOptions);
      unreachableBulb = client.getBulb(testDevices['unreachable'].deviceOptions);
    });

    it('should find a bulb by IP address', function () {
      return expect(bulb.getSysInfo()).to.eventually.have.property('err_code', 0);
    });

    it('should be rejected with an invalid IP address', function () {
      return expect(unreachableBulb.getSysInfo({ timeout: 500 })).to.eventually.be.rejected;
    });
  });

  describe('.send()', function () {
    let client;
    let options;
    before(function () {
      client = getTestClient();
      options = testDevices['anydevice'].deviceOptions;
    });
    [{ transport: 'tcp' }, { transport: 'udp' }].forEach((sendOptions) => {
      it(`should return info with string payload ${sendOptions.transport}`, function () {
        return expect(client.send('{"system":{"get_sysinfo":{}}}', options.host, options.port, sendOptions))
          .to.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
      });
      it(`should return info with object payload${sendOptions.transport}`, function () {
        return expect(client.send({'system': {'get_sysinfo': {}}}, options.host, options.port, sendOptions))
          .to.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
      });
    });
  });
});
