/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, getTestClient, testDevices } = require('../setup');

const rewire = require('rewire');
const { Client, ResponseError } = require('../../src');
const Device = rewire('../../src/device');

const processResponse = Device.__get__('processResponse');

const cloudTests = require('../shared/cloud');
const emeterTests = require('../shared/emeter');
const netifTests = require('./netif');
const scheduleTests = require('../shared/schedule');
const timeTests = require('../shared/time');

describe('Device', function () {
  this.timeout(5000);
  this.slow(2000);
  let client;

  before(function () {
    client = getTestClient();
  });

  describe('private', function () {
    describe('processResponse', function () {
      it('return fragment for single command emeter.get_realtime', function () {
        let command = {emeter: {get_realtime: {}}};
        let response = { emeter: { get_realtime: { current: 0.012933, voltage: 120.793324, power: 0, total: 0.001, err_code: 0 } } };
        let pr = processResponse(command, response);
        expect(pr).to.have.keys('current', 'voltage', 'power', 'total', 'err_code');
      });

      it('to throw ResponseError for single command emeter.get_realtime not supported', function () {
        let command = {emeter: {get_realtime: {}}};
        let response = { emeter: { err_code: -1, err_msg: 'module not support' } };
        expect(() => processResponse(command, response))
          .to.throw(ResponseError).and.to.have.deep.property('response', { err_code: -1, err_msg: 'module not support' });
      });

      it('return fragment for single command system.set_dev_alias', function () {
        let command = {system: {set_dev_alias: {alias: 'New Alias'}}};
        let response = { system: { set_dev_alias: { err_code: 0 } } };
        let pr = processResponse(command, response);
        expect(pr).to.have.property('err_code', 0);
      });

      it('return fragment for single command netif.get_scaninfo', function () {
        let command = {netif: {get_scaninfo: {refresh: 1, timeout: 3}}};
        let response = { netif: { get_scaninfo: { ap_list: [ { ssid: 'wifi_network_1', key_type: 1 }, { ssid: 'wifi_network_2', key_type: 2 }, { ssid: 'wifi_network_3', key_type: 3 } ], err_code: 0 } } };
        let pr = processResponse(command, response);
        expect(pr).to.have.property('err_code', 0);
        expect(pr).to.have.property('ap_list');
      });

      it('return whole result for multiple commands emeter.get_realtime system.get_sysinfo', function () {
        let command = {'emeter': {'get_realtime': {}}, 'system': {'get_sysinfo': {}}};
        let response = { emeter: { get_realtime: { current: 0.01257, voltage: 121.162244, power: 0, total: 0.001, err_code: 0 } }, system: { get_sysinfo: { err_code: 0, sw_ver: '1.0.8 Build 151113 Rel.24658', hw_ver: '1.0', type: 'IOT.SMARTPLUGSWITCH', model: 'HS110(US)', mac: '00:00:00:00:00:00', deviceId: '1234', hwId: '1234', fwId: '1234', oemId: '1234', alias: 'sup', dev_name: 'Wi-Fi Smart Plug With Energy Monitoring', icon_hash: '', relay_state: 0, on_time: 0, active_mode: 'schedule', feature: 'TIM:ENE', updating: 0, rssi: -63, led_off: 0, latitude: 0.000000, longitude: 0.000000 } } };
        let pr = processResponse(command, response);
        expect(pr).to.have.keys('emeter', 'system');
        expect(pr.emeter.get_realtime).to.have.keys('current', 'voltage', 'power', 'total', 'err_code');
        expect(pr.system.get_sysinfo).to.include.keys('err_code', 'sw_ver', 'hw_ver', 'type');
      });

      it('to throw ResponseError when err_code missing', function () {
        let command = { emeter: { get_realtime: {} } };
        let response = { emeter: { get_realtime: {} } };
        expect(() => processResponse(command, response))
          .to.throw(ResponseError, 'err_code missing');
      });
    });
  });

  testDevices.forEach(function (testDevice) {
    let device;
    let time;

    context(testDevice.name, function () {
      // beforeEach() doesn't work with assigning to `this`
      before(async function () {
        if (testDevice.getDevice) {
          device = await testDevice.getDevice();
          this.device = device;
          time = device.apiModuleNamespace.timesetting;
        }
      });
      beforeEach(async function () {
        // before() doesn't skip nested describes
        if (!testDevice.getDevice) {
          return this.skip();
        }
        device = await testDevice.getDevice();
        this.device = device;
      });

      describe('constructor', function () {
        it('should inherit defaultSendOptions from Client', function () {
          let timeout = 9999;
          let transport = 'udp';
          let client = new Client({ defaultSendOptions: { timeout, transport } });
          let anotherDevice = client.getDeviceFromType(device.type);
          expect(client.defaultSendOptions.timeout, 'client').to.equal(timeout);
          expect(client.defaultSendOptions.transport, 'client').to.equal(transport);
          expect(anotherDevice.defaultSendOptions.timeout, 'device').to.equal(timeout);
          expect(anotherDevice.defaultSendOptions.transport, 'device').to.equal(transport);
        });
      });

      describe('#send', function () {
        it('should send a single valid command and receive response', async function () {
          let response = await device.send('{"system":{"get_sysinfo":{}}}');
          expect(response).to.have.nested.property('system.get_sysinfo.err_code', 0);
        });
        it('should send multiple valid commands (same module) and receive response', async function () {
          let response = await device.send(`{"${time}":{"get_time":{},"get_timezone":{}}}`);
          expect(response[time].get_time.err_code).to.eql(0);
          expect(response[time].get_timezone.err_code).to.eql(0);
        });
        it('should send multiple valid commands (diff modules) and receive response', async function () {
          let response = await device.send(`{"system":{"get_sysinfo":{}},"${time}":{"get_time":{}}}`);
          expect(response).to.have.nested.property('system.get_sysinfo.err_code', 0);
          expect(response[time].get_time.err_code).to.eql(0);
        });
        it('should send a single invalid command (member) and receive response', async function () {
          let response = await device.send('{"system":{"INVALID_MEMBER":{}}}');
          expect(response.system.INVALID_MEMBER.err_code).to.be.oneOf([-2, -2000]);
        });
        it('should send a single invalid command (module) and receive response', async function () {
          let response = await device.send('{"INVALID_MODULE":{"INVALID_MEMBER":{}}}');
          expect(response).to.have.nested.property('INVALID_MODULE.err_code');
          expect(response.INVALID_MODULE.err_code).to.be.oneOf([-1, -2001]);
        });
        it('should send mutiple invalid commands and receive response', async function () {
          let response = await device.send('{"system":{"INVALID_MEMBER":{}},"INVALID_MODULE":{"INVALID_MEMBER":{}}}');
          expect(response.INVALID_MODULE.err_code).to.be.oneOf([-1, -2001]);
          expect(response.system.INVALID_MEMBER.err_code).to.be.oneOf([-2, -2000]);
        });
      });

      describe('#sendCommand', function () {
        it('should send a single valid comand and receive response', async function () {
          let response = await device.sendCommand('{"system":{"get_sysinfo":{}}}');
          return expect(response).to.have.property('err_code', 0);
        });
        it('should send multiple valid commands (same module) and receive response', async function () {
          let response = await device.sendCommand(`{"${time}":{"get_time":{},"get_timezone":{}}}`);
          expect(response[time].get_time.err_code).to.eql(0);
          expect(response[time].get_timezone.err_code).to.eql(0);
        });
        it('should send multiple valid commands (diff modules) and receive response', async function () {
          let response = await device.sendCommand(`{"system":{"get_sysinfo":{}},"${time}":{"get_time":{}}}`);
          expect(response).to.have.nested.property('system.get_sysinfo.err_code', 0);
          expect(response[time].get_time.err_code).to.eql(0);
        });
        it('should send a single invalid command (member) and reject with ResponseError', function () {
          return device.sendCommand('{"system":{"INVALID_MEMBER":{}}}').catch((err) => {
            expect(err).to.be.instanceof(ResponseError);
            expect(err.response).to.have.nested.property('err_code');
            expect(err.response.err_code).to.be.oneOf([-2, -2000]);
          });
        });
        it('should send a single invalid command (module) and reject with ResponseError', function () {
          return device.sendCommand('{"INVALID_MODULE":{"INVALID_MEMBER":{}}}').catch((err) => {
            expect(err).to.be.instanceof(ResponseError);
            expect(err.response).to.have.nested.property('err_code');
            expect(err.response.err_code).to.be.oneOf([-1, -2001]);
          });
        });
        it('should send multiple invalid commands and reject with ResponseError', function () {
          return device.sendCommand('{"system":{"INVALID_MEMBER":{}},"INVALID_MODULE":{"INVALID_MEMBER":{}}}').catch((err) => {
            expect(err).to.be.an.instanceof(ResponseError);
            expect(err.response.INVALID_MODULE.err_code).to.be.oneOf([-1, -2001]);
            expect(err.response.system.INVALID_MEMBER.err_code).to.be.oneOf([-2, -2000]);
          });
        });
      });

      describe('#sysInfo get', function () {
        it('should return sysInfo after getSysInfo called', async function () {
          let si = await device.getSysInfo();
          expect(device.sysInfo).to.eql(si);
        });
      });

      describe('#alias get', function () {
        it('should return alias from cached sysInfo', function () {
          expect(device.alias).to.eql(device.sysInfo.alias);
          device.sysInfo.alias = 'My Test alias';
          expect(device.alias).to.eql(device.sysInfo.alias);
        });
      });

      describe('#deviceId get', function () {
        it('should return deviceId from cached sysInfo', function () {
          expect(device.deviceId).to.eql(device.sysInfo.deviceId);
          device.sysInfo.deviceId = 'My Test deviceId';
          expect(device.deviceId).to.eql(device.sysInfo.deviceId);
        });
      });

      describe('#description get', function () {
        it('should return description from cached sysInfo', function () {
          expect(device.description).to.eql(device.sysInfo.description || device.sysInfo.dev_name);
          device.sysInfo.description = 'My Test deviceName';
          expect(device.description).to.eql(device.sysInfo.description || device.sysInfo.dev_name);
        });
      });

      describe('#model get', function () {
        it('should return model from cached sysInfo', function () {
          expect(device.model).to.eql(device.sysInfo.model);
          device.sysInfo.model = 'My Test model';
          expect(device.model).to.eql(device.sysInfo.model);
        });
      });

      describe('#type get', function () {
        it('should return type from cached sysInfo', function () {
          expect(device.type).to.eql(device.sysInfo.type || device.sysInfo.mic_type);
          device.sysInfo.type = 'My Test type';
          device.sysInfo.mic_type = undefined;
          expect(device.type).to.eql(device.sysInfo.type);
          device.sysInfo.type = undefined;
          device.sysInfo.mic_type = 'My Test mic_type';
          expect(device.type).to.eql(device.sysInfo.mic_type);
        });
      });

      describe('#deviceType get', function () {
        it('should return type of "device" before querying device', function () {
          let generalDevice = client.getCommonDevice(testDevice.deviceOptions);
          expect(generalDevice.deviceType).to.equal('device');
        });
        it('should return actual type after querying device', async function () {
          let generalDevice = client.getCommonDevice(testDevice.deviceOptions);
          await generalDevice.getSysInfo();
          expect(generalDevice.deviceType).to.eql(testDevice.deviceType);
        });
      });

      describe('#softwareVersion get', function () {
        it('should return softwareVersion from cached sysInfo', function () {
          expect(device.softwareVersion).to.eql(device.sysInfo.sw_ver);
          device.sysInfo.sw_ver = 'My Test sw_ver';
          expect(device.softwareVersion).to.eql(device.sysInfo.sw_ver);
        });
      });

      describe('#hardwareVersion get', function () {
        it('should return hardwareVersion from cached sysInfo', function () {
          expect(device.hardwareVersion).to.eql(device.sysInfo.hw_ver);
          device.sysInfo.hw_ver = 'My Test hw_ver';
          expect(device.hardwareVersion).to.eql(device.sysInfo.hw_ver);
        });
      });

      describe('#mac get', function () {
        it('should return mac from cached sysInfo', function () {
          expect(device.mac).to.eql(device.sysInfo.mac || device.sysInfo.mic_mac || device.sysInfo.ethernet_mac);
          device.sysInfo.mac = 'My Test mac';
          device.sysInfo.mic_mac = undefined;
          device.sysInfo.ethernet_mac = undefined;
          expect(device.mac).to.eql(device.sysInfo.mac);
          device.sysInfo.mac = undefined;
          device.sysInfo.mic_mac = 'My Test mic_mac';
          device.sysInfo.ethernet_mac = undefined;
          expect(device.mac).to.eql(device.sysInfo.mic_mac);
          device.sysInfo.mac = undefined;
          device.sysInfo.mic_mac = undefined;
          device.sysInfo.ethernet_mac = 'My Test ethernet_mac';
          expect(device.mac).to.eql(device.sysInfo.ethernet_mac);
        });
      });

      describe('#macNormalized get', function () {
        it('should return normalized mac from cached sysInfo', function () {
          device.sysInfo.mac = 'My Test mac';
          device.sysInfo.mic_mac = undefined;
          device.sysInfo.ethernet_mac = undefined;
          expect(device.macNormalized).to.eql('MYTESTMAC');
          device.sysInfo.mac = undefined;
          device.sysInfo.mic_mac = 'My Test mic_mac';
          device.sysInfo.ethernet_mac = undefined;
          expect(device.macNormalized).to.eql('MYTESTMICMAC');
          device.sysInfo.mac = undefined;
          device.sysInfo.mic_mac = undefined;
          device.sysInfo.ethernet_mac = 'My Test ethernet_mac';
          expect(device.macNormalized).to.eql('MYTESTETHERNETMAC');
        });
      });

      describe('#getSysInfo()', function () {
        it('should return info', function () {
          return expect(device.getSysInfo()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#setAlias()', function () {
        let origAlias;
        before(async function () {
          if (!testDevice.getDevice) return;
          let si = await device.getSysInfo();
          origAlias = si.alias;
        });
        after(async function () {
          if (!testDevice.getDevice) return;
          expect((await device.setAlias(origAlias))).to.be.true;
          let si = await device.getSysInfo();
          expect(si.alias).to.equal(origAlias);
        });

        it('should change the alias', async function () {
          let testAlias = `Testing ${Math.floor(Math.random() * (100 + 1))}`;
          expect((await device.setAlias(testAlias))).to.be.true;
          let si = await device.getSysInfo();
          expect(si.alias).to.equal(testAlias);
        });
      });

      describe('#setLocation()', function () {
        it('should return model', function () {
          return expect(device.setLocation(10, 10)).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getModel()', function () {
        it('should return model', function () {
          return expect(device.getModel()).to.eventually.match(/^HS\d\d\d|^LB\d\d\d/);
        });
      });

      describe('#reboot()', function () {
        it('(simulator only) should reboot', function () {
          if (testDevice.type !== 'simulated') this.skip();
          return expect(device.reboot(1)).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#reset()', function () {
        it('(simulator only) should reset', function () {
          if (testDevice.type !== 'simulated') this.skip();
          return expect(device.reset(1)).to.eventually.have.property('err_code', 0);
        });
      });

      cloudTests(testDevice);
      emeterTests(testDevice);
      netifTests(testDevice);
      scheduleTests(testDevice);
      timeTests(testDevice);
    });
  });
});
