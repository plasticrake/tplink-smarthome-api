/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { config, expect, getTestClient, testDevices } = require('./setup');

const { default: Client } = require('../src/client');
const { default: Device } = require('../src/device');
const { default: Plug } = require('../src/plug');
const { default: Bulb } = require('../src/bulb');

const { compareMac } = require('../src/utils');

describe('Client', function () {
  describe('constructor', function () {
    it('should use custom logger', function () {
      const debugSpy = sinon.spy();
      const infoSpy = sinon.spy();

      const logger = {
        debug: debugSpy,
        info: infoSpy,
      };

      const client = new Client({ logger });

      client.log.debug('debug msg');
      client.log.info('info msg');

      expect(debugSpy).to.be.calledOnce;
      expect(infoSpy).to.be.calledOnce;
    });
  });

  describe('#startDiscovery()', function () {
    this.retries(1);
    this.timeout(config.defaultTestTimeout * 2);
    this.slow(config.defaultTestTimeout);

    let client;
    beforeEach('startDiscovery', function () {
      client = getTestClient();
    });

    afterEach('startDiscovery', function () {
      client.stopDiscovery();
    });

    it('should emit device-new when finding a new device', function (done) {
      client
        .startDiscovery({ discoveryInterval: 250 })
        .once('device-new', (device) => {
          expect(device).to.be.an.instanceof(Device);
          client.stopDiscovery();
          done();
        });
    });

    it('should emit emeter-realtime-update', function (done) {
      client
        .startDiscovery({ discoveryInterval: 250 })
        .on('device-new', (device) => {
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
      const { mac } = testDevices.anyDevice;
      const { host } = testDevices.anyDevice.deviceOptions;
      expect('mac', mac).to.be.a('string').and.not.empty;
      expect('host', host).to.be.a('string').and.not.empty;

      client
        .startDiscovery({ discoveryInterval: 250, devices: [{ host }] })
        .on('device-new', (device) => {
          if (device.mac === mac) {
            client.stopDiscovery();
            done();
          }
        });
    });

    it('should emit device-new when finding a new device with a deviceType filter', function (done) {
      client
        .startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'] })
        .once('device-new', (device) => {
          expect(device).to.be.an.instanceof(Device);
          client.stopDiscovery();
          done();
        });
    });

    it('should ONLY emit device-new for specified deviceTypes', function (done) {
      client
        .startDiscovery({ discoveryInterval: 250, deviceTypes: ['plug'] })
        .on('device-new', (device) => {
          expect(device.deviceType).to.eql('plug');
        });
      setTimeout(done, 1000);
    });

    it('should NOT emit device-new with an incorrect deviceType filter', function (done) {
      client
        .startDiscovery({
          discoveryInterval: 250,
          deviceTypes: ['invalidDeviceType'],
        })
        .once('device-new', (device) => {
          client.stopDiscovery();
          expect(device).to.not.exist;
        });
      setTimeout(done, 1000);
    });

    it('should ONLY emit device-new for specified macAddresses', function (done) {
      const spy = sinon.spy();
      const { mac } = testDevices.anyDevice;
      expect(mac).to.be.a('string').and.not.empty;

      client
        .startDiscovery({ discoveryInterval: 250, macAddresses: [mac] })
        .on('device-new', spy);

      setTimeout(() => {
        expect(spy, `MAC:[${mac}] not found`).to.be.called;
        expect(spy).to.always.be.calledWithMatch({ mac });
        done();
      }, 1000);
    });

    it('should NOT emit device-new for specified excludedMacAddresses', function (done) {
      const spy = sinon.spy();
      const { mac } = testDevices.anyDevice;
      expect(mac, 'mac blank').to.be.a('string').and.not.empty;

      client
        .startDiscovery({ discoveryInterval: 250, excludeMacAddresses: [mac] })
        .on('device-new', spy);

      setTimeout(() => {
        client.stopDiscovery();
        expect(spy).to.be.called;
        expect(spy).to.not.be.calledWithMatch({ mac });
        done();
      }, 1000);
    });

    it('should NOT emit device-new for devices not meeting filterCallback', function (done) {
      const spy = sinon.spy();
      const { mac } = testDevices.anyDevice;
      expect(mac, 'mac blank').to.be.a('string').and.not.empty;

      client
        .startDiscovery({
          discoveryInterval: 250,
          filterCallback: (sysInfo) => {
            return !compareMac(sysInfo.mac, mac);
          },
        })
        .on('device-new', spy);

      setTimeout(() => {
        client.stopDiscovery();
        expect(spy).to.be.called;
        expect(spy).to.not.be.calledWithMatch({ mac });
        done();
      }, 1000);
    });

    it('should NOT emit device-new for devices not meeting filterCallback -- all devices', function (done) {
      const spy = sinon.spy();

      client
        .startDiscovery({ discoveryInterval: 250, filterCallback: () => false })
        .on('device-new', spy);

      setTimeout(() => {
        client.stopDiscovery();
        expect(spy).to.not.be.called;
        done();
      }, 1000);
    });

    it('should emit device-new for devices meeting filterCallback -- all devices', function (done) {
      client
        .startDiscovery({ discoveryInterval: 250, filterCallback: () => true })
        .on('device-new', () => {
          client.stopDiscovery();
          done();
        });
    });

    const events = ['new', 'online', 'offline'];
    const eventTests = [];
    [
      { typeName: 'device', type: Device },
      { typeName: 'plug', type: Plug },
      { typeName: 'bulb', type: Bulb },
    ].forEach((t) => {
      events.forEach((e) => {
        eventTests.push({ ...t, event: e });
      });
    });

    eventTests.forEach((et) => {
      const eventName = `${et.typeName}-${et.event}`;

      it(`should emit ${eventName} when finding a(n) ${et.event} ${et.typeName}`, async function () {
        if (et.event === 'offline') {
          let device;
          switch (et.typeName) {
            case 'device':
              device = testDevices.anyDevice;
              break;
            case 'plug':
              device = testDevices.anyPlug;
              break;
            case 'bulb':
              device = testDevices.anyBulb;
              break;
            default:
              throw new Error(`Unexpected device type:${et.typeName}`);
          }

          if (!('getDevice' in device)) this.skip();

          const invalidDevice = await client.getDevice(device.deviceOptions);
          invalidDevice.host = testDevices.unreachable.deviceOptions.host;
          invalidDevice.status = 'online';
          invalidDevice.seenOnDiscovery = 0;
          client.devices.set(`${invalidDevice.deviceId}INV`, invalidDevice);
        }

        return new Promise((resolve) => {
          client
            .startDiscovery({ discoveryInterval: 100, offlineTolerance: 2 })
            .once(eventName, (device) => {
              expect(device).to.be.an.instanceof(et.type);
              client.stopDiscovery();
              resolve();
            });
        });
      });
    });

    it('should timeout with timeout set', function (done) {
      this.slow(100);
      client.startDiscovery({ discoveryInterval: 0, discoveryTimeout: 1 });
      setTimeout(() => {
        expect(client.discoveryPacketSequence).to.be.above(0);
        expect(client.discoveryTimer).to.not.exist;
        done();
      }, 50);
    });

    it('should emit discovery-invalid for the unreliable test device', function (done) {
      const device = testDevices.unreliable;
      if (!device.deviceOptions || !device.deviceOptions.port) this.skip();

      client
        .startDiscovery({ discoveryInterval: 250 })
        .on('discovery-invalid', ({ rinfo, response, decryptedResponse }) => {
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
      client
        .startDiscovery({
          discoveryInterval: 250,
          deviceTypes: ['plug'],
          breakoutChildren: true,
        })
        .on('device-new', (device) => {
          if (device.model.match(/^HS300/)) {
            expect(device.children).to.have.property('size', 6);
            expect(device.sysInfo.children).to.have.lengthOf(
              device.children.size
            );
            if (devices[device.deviceId] == null) {
              devices[device.deviceId] = {};
              devices[device.deviceId].children = [];
            }
            devices[device.deviceId].children.push(device.childId);

            if (
              devices[device.deviceId].children.length >= device.children.size
            ) {
              devices[device.deviceId].children.sort().forEach((childId, i) => {
                expect(childId).to.eql(`${device.deviceId}0${i}`);
              });
              done();
            }
          }
        });
    });

    it('should emit device-new for only the device and not each child for devices with children and breakoutChildren is false', function (done) {
      const devices = {};
      client
        .startDiscovery({
          discoveryInterval: 250,
          deviceTypes: ['plug'],
          breakoutChildren: false,
        })
        .on('device-new', (device) => {
          if (device.model.match(/^HS300/)) {
            expect(device.children).to.have.property('size', 6);
            expect(device.sysInfo.children).to.have.lengthOf(
              device.children.size
            );
            expect(devices[device.deviceId]).to.be.undefined;
            devices[device.deviceId] = device;
          }
        });
      setTimeout(() => {
        expect(Object.keys(devices)).length.to.be.above(0);
        done();
      }, 1000);
    });
  });

  config.testSendOptionsSets.forEach((sendOptions) => {
    context(sendOptions.name, function () {
      this.retries(1);
      describe('#getDevice()', function () {
        let client;
        let device;

        before(async function () {
          client = getTestClient(sendOptions);
          device = await client.getDevice(testDevices.anyDevice.deviceOptions);
        });

        after(function () {
          device.closeConnection();
        });

        it('should find a device by IP address', function () {
          return expect(device.getSysInfo()).to.eventually.have.property(
            'err_code',
            0
          );
        });

        it('should be rejected with an invalid IP address', async function () {
          let error;
          const { deviceOptions } = testDevices.unreachable;
          try {
            const dev = await client.getDevice(deviceOptions, {
              timeout: 500,
            });
            dev.closeConnection();
          } catch (err) {
            error = err;
          }
          expect(error).to.be.instanceOf(Error);
        });
      });

      describe('#getPlug()', function () {
        let skipped = false;
        let client;
        let plug;
        let unreachablePlug;
        let sysInfo;

        before(async function () {
          if (!('getDevice' in testDevices.anyPlug)) {
            skipped = true;
            this.skip();
          }

          client = getTestClient(sendOptions);
          const { host, port } = testDevices.anyPlug.deviceOptions;
          sysInfo = await client.getSysInfo(host, port);

          plug = client.getPlug({
            ...testDevices.anyPlug.deviceOptions,
            sysInfo,
          });

          unreachablePlug = client.getPlug({
            ...testDevices.unreachable.deviceOptions,
            sysInfo,
          });
        });

        after(function () {
          if (skipped) return;
          plug.closeConnection();
        });

        it('should find a plug by IP address', function () {
          return expect(plug.getSysInfo()).to.eventually.have.property(
            'err_code',
            0
          );
        });

        it('should be rejected with an invalid IP address', function () {
          return expect(
            unreachablePlug.getSysInfo({ timeout: 500 })
          ).to.eventually.be.rejected;
        });
      });

      describe('#getBulb()', function () {
        let skipped = false;
        let client;
        let bulb;
        let unreachableBulb;
        let sysInfo;

        before(async function () {
          if (!('getDevice' in testDevices.anyBulb)) {
            skipped = true;
            this.skip();
          }

          client = getTestClient(sendOptions);

          const { host, port } = testDevices.anyBulb.deviceOptions;
          sysInfo = await client.getSysInfo(host, port);

          bulb = await client.getBulb({
            ...testDevices.anyBulb.deviceOptions,
            sysInfo,
          });
          unreachableBulb = client.getBulb({
            ...testDevices.unreachable.deviceOptions,
            sysInfo,
          });
        });

        after(function () {
          if (skipped) return;
          bulb.closeConnection();
        });

        it('should find a bulb by IP address', function () {
          return expect(bulb.getSysInfo()).to.eventually.have.property(
            'err_code',
            0
          );
        });

        it('should be rejected with an invalid IP address', function () {
          return expect(
            unreachableBulb.getSysInfo({ timeout: 500 })
          ).to.eventually.be.rejected;
        });
      });
    });

    describe('.send()', function () {
      let client;
      let options;
      before(function () {
        client = getTestClient(sendOptions);
        options = testDevices.anyDevice.deviceOptions;
      });
      ['tcp', 'udp'].forEach((transport) => {
        it(`should return info with string payload ${transport}`, async function () {
          return expect(
            JSON.parse(
              await client.send(
                '{"system":{"get_sysinfo":{}}}',
                options.host,
                options.port,
                { sendOptions: { transport } }
              )
            )
          ).to.have.nested.property('system.get_sysinfo.err_code', 0);
        });
        it(`should return info with object payload ${sendOptions.transport}`, async function () {
          return expect(
            JSON.parse(
              await client.send(
                { system: { get_sysinfo: {} } },
                options.host,
                options.port,
                { sendOptions: { transport } }
              )
            )
          ).to.have.nested.property('system.get_sysinfo.err_code', 0);
        });

        it(`should return info with object payload ${sendOptions.transport}`, async function () {
          return expect(
            JSON.parse(
              await client.send(
                { system: { get_sysinfo: {} } },
                options.host,
                options.port,
                { sendOptions: { transport } }
              )
            )
          ).to.have.nested.property('system.get_sysinfo.err_code', 0);
        });
      });
    });
  });
});
