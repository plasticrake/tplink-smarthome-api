/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, sinon, getTestClient, testDevices, testSendOptions } = require('./setup');

const Device = require('../src/device');
const Plug = require('../src/plug');
const Bulb = require('../src/bulb');

const { compareMac } = require('../src/utils');

describe('Client', function () {
  this.timeout(5000);
  this.slow(2000);
  this.retries(2);

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

    it('should emit emeter-realtime-update', function (done) {
      client.startDiscovery({ discoveryInterval: 250 }).on('device-new', (device) => {
        expect(device).to.be.an.instanceof(Device);
        device.on('emeter-realtime-update', (realtime) => {
          if (Object.keys(realtime).length > 0) {
            expect(realtime).to.not.eql({});
            client.stopDiscovery();
            done();
          }
        });
      });
    });

    it('should emit device-new when finding a new device with `devices` specified', function (done) {
      const mac = testDevices['anydevice'].mac;
      const host = testDevices['anydevice'].deviceOptions.host;
      expect(mac).to.be.a('string').and.not.empty;
      expect(host).to.be.a('string').and.not.empty;

      client.startDiscovery({ discoveryInterval: 250, devices: [{ host }] }).on('device-new', (device) => {
        if (device.mac === mac) {
          client.stopDiscovery();
          done();
        }
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
        expect(spy).to.always.be.calledWithMatch({ mac: mac });
        done();
      }, 1000);
    });

    it('should NOT emit device-new for specified excludedMacAddresses', function (done) {
      let spy = sinon.spy();
      let mac = testDevices['anydevice'].mac;
      expect(mac, 'mac blank').to.be.a('string').and.not.empty;

      client.startDiscovery({ discoveryInterval: 250, excludeMacAddresses: [mac] }).on('device-new', spy);

      setTimeout(() => {
        client.stopDiscovery();
        expect(spy).to.be.called;
        expect(spy).to.not.be.calledWithMatch({ mac });
        done();
      }, 1000);
    });

    it('should NOT emit device-new for devices not meeting filterCallback', function (done) {
      let spy = sinon.spy();
      let mac = testDevices['anydevice'].mac;
      expect(mac, 'mac blank').to.be.a('string').and.not.empty;

      client.startDiscovery({ discoveryInterval: 250,
        filterCallback: (sysInfo) => {
          return !compareMac(sysInfo.mac, mac);
        } }).on('device-new', spy);

      setTimeout(() => {
        client.stopDiscovery();
        expect(spy).to.be.called;
        expect(spy).to.not.be.calledWithMatch({ mac });
        done();
      }, 1000);
    });

    it('should NOT emit device-new for devices not meeting filterCallback -- all devices', function (done) {
      let spy = sinon.spy();

      client.startDiscovery({ discoveryInterval: 250, filterCallback: () => false }).on('device-new', spy);

      setTimeout(() => {
        client.stopDiscovery();
        expect(spy).to.not.be.called;
        done();
      }, 1000);
    });

    it('should emit device-new for devices meeting filterCallback -- all devices', function (done) {
      client.startDiscovery({ discoveryInterval: 250, filterCallback: () => true }).on('device-new', () => {
        client.stopDiscovery();
        done();
      });
    });

    let events = ['new', 'online', 'offline'];
    let eventTests = [];
    [
      { typeName: 'device', type: Device },
      { typeName: 'plug', type: Plug },
      { typeName: 'bulb', type: Bulb }
    ].forEach((t) => {
      events.forEach((e) => {
        eventTests.push(Object.assign({}, t, { event: e }));
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

      client.startDiscovery({ discoveryInterval: 250 }).on('discovery-invalid', ({ rinfo, response, decryptedResponse }) => {
        expect(response).to.be.instanceof(Buffer);
        expect(decryptedResponse).to.be.instanceof(Buffer);

        if (rinfo.port === device.deviceOptions.port) {
          client.stopDiscovery();
          done();
        }
      });
    });

    it('should emit device-new for each child for devices with children and breakoutChildren is true', function (done) {
      const devices = {};
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'], breakoutChildren: true }).on('device-new', (device) => {
        if (device.model.match(/^HS300/)) {
          expect(device.sysInfo.children.length).to.be.above(1);
          expect(device.sysInfo.children.length).to.eql(device.children.size);
          if (devices[device.deviceId] == null) {
            devices[device.deviceId] = {};
            devices[device.deviceId].children = [];
          }
          devices[device.deviceId].children.push(device.childId);

          if (devices[device.deviceId].children.length >= device.children.size) {
            devices[device.deviceId].children.sort().forEach((childId, i) => {
              expect(childId).to.eql(device.deviceId + '0' + i);
            });
            done();
          }
        }
      });
    });

    it('should emit device-new for only the device and not each child for devices with children and breakoutChildren is false', function (done) {
      const devices = {};
      client.startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'], breakoutChildren: false }).on('device-new', (device) => {
        if (device.model.match(/^HS300/)) {
          expect(device.sysInfo.children.length).to.be.above(1);
          expect(device.sysInfo.children.length).to.eql(device.children.size);
          expect(devices[device.deviceId]).to.be.undefined;
          devices[device.deviceId] = device;
        }
      });
      setTimeout(() => {
        expect(Object.keys(devices).length).to.be.above(0);
        done();
      }, 1000);
    });
  });

  testSendOptions.forEach((testSendOptions) => {
    context(testSendOptions.name, function () {
      describe('#getDevice()', function () {
        this.timeout(2000);
        this.slow(1500);
        let client;
        let device;

        before(async function () {
          client = getTestClient(testSendOptions);
          device = await client.getDevice(testDevices['anydevice'].deviceOptions);
        });

        after(function () {
          device.closeConnection();
        });

        it('should find a device by IP address', function () {
          return expect(device.getSysInfo()).to.eventually.have.property('err_code', 0);
        });

        it('should be rejected with an invalid IP address', async function () {
          let error;
          let deviceOptions = testDevices['unreachable'].deviceOptions;
          let device;
          try {
            device = await client.getDevice(deviceOptions, { timeout: 500 });
            device.closeConnection();
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
          client = getTestClient(testSendOptions);
          plug = client.getPlug(testDevices['anyplug'].deviceOptions);
          unreachablePlug = client.getPlug(testDevices['unreachable'].deviceOptions);
        });

        after(function () {
          plug.closeConnection();
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
          client = getTestClient(testSendOptions);
          bulb = client.getBulb(testDevices['anybulb'].deviceOptions);
          unreachableBulb = client.getBulb(testDevices['unreachable'].deviceOptions);
        });

        after(function () {
          bulb.closeConnection();
        });

        it('should find a bulb by IP address', function () {
          return expect(bulb.getSysInfo()).to.eventually.have.property('err_code', 0);
        });

        it('should be rejected with an invalid IP address', function () {
          return expect(unreachableBulb.getSysInfo({ timeout: 500 })).to.eventually.be.rejected;
        });
      });
    });

    describe('.send()', function () {
      let client;
      let options;
      before(function () {
        client = getTestClient(testSendOptions);
        options = testDevices['anydevice'].deviceOptions;
      });
      [{ transport: 'tcp' }, { transport: 'udp' }].forEach((sendOptions) => {
        it(`should return info with string payload ${sendOptions.transport}`, function () {
          return expect(client.send('{"system":{"get_sysinfo":{}}}', options.host, options.port, sendOptions))
            .to.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
        });
        it(`should return info with object payload${sendOptions.transport}`, function () {
          return expect(client.send({ 'system': { 'get_sysinfo': {} } }, options.host, options.port, sendOptions))
            .to.eventually.have.nested.property('system.get_sysinfo.err_code', 0);
        });
      });
    });
  });
});
