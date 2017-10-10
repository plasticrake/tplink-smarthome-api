/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(chaiAsPromised);
chai.use(sinonChai);

const rewire = require('rewire');

const { getTestClient, testDevices } = require('./setup');
const Hs100Api = require('../src');
const Device = rewire('../src/device');
const utils = require('../src/utils');
const ResponseError = utils.ResponseError;

const processResponse = Device.__get__('processResponse');

describe('Device', function () {
  let client;

  before(function () {
    this.timeout(4000);
    this.slow(2000);
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

  testDevices.forEach((testDevice) => {
    let device;
    let options;
    let deviceType;
    context(testDevice.name, function () {
      beforeEach(async function () {
        if (!testDevice.getDevice) {
          this.skip();
        }
        device = await testDevice.getDevice();
        options = testDevice.options;
        deviceType = testDevice.deviceType;
      });

      describe('constructor', function () {
        it('should inherit timeout from Client', function () {
          let timeout = 9999;
          let client = new Hs100Api.Client({timeout: timeout});
          let anotherDevice = client.getDeviceFromType(device.type);
          expect(client.timeout).to.equal(timeout);
          expect(anotherDevice.timeout).to.equal(timeout);
        });
      });

      describe('#send', function () {
        it('should send a single valid command and receive response', async function () {
          let response = await device.send('{"system":{"get_sysinfo":{}}}');
          expect(response).to.have.nested.property('system.get_sysinfo.err_code', 0);
        });
        it('should send a multiple valid commands (same module) and receive response', async function () {
          let time = device.apiModuleNamespace.timesetting;
          let response = await device.send(`{"${time}":{"get_time":{},"get_timezone":{}}}`);
          expect(response[time]).to.have.nested.property('get_time.err_code', 0);
          expect(response[time]).to.have.nested.property('get_timezone.err_code', 0);
        });
        it('should send a multiple valid commands (diff modules) and receive response', async function () {
          let response = await device.send('{"system":{"get_sysinfo":{}},"netif":{"get_scaninfo":{}}}');
          expect(response).to.have.nested.property('system.get_sysinfo.err_code', 0);
          expect(response).to.have.nested.property('netif.get_scaninfo.err_code', 0);
        });
        it('should send a single invalid command (member) and receive response', async function () {
          let response = await device.send('{"system":{"INVALID_MEMBER":{}}}');
          expect(response).to.have.nested.property('system.INVALID_MEMBER.err_code', -2);
        });
        it('should send a single invalid command (module) and receive response', async function () {
          let response = await device.send('{"INVALID_MODULE":{"INVALID_MEMBER":{}}}');
          expect(response).to.have.nested.property('INVALID_MODULE.err_code', -1);
        });
        it('should send mutiple invalid commands and receive response', async function () {
          let response = await device.send('{"system":{"INVALID_MEMBER":{}},"INVALID_MODULE":{"INVALID_MEMBER":{}}}');
          expect(response).to.have.nested.property('INVALID_MODULE.err_code', -1);
          expect(response).to.have.nested.property('system.INVALID_MEMBER.err_code', -2);
        });
      });

      describe('#sendCommand', function () {
        it('should send a single valid comand and receive response', async function () {
          let response = await device.sendCommand('{"system":{"get_sysinfo":{}}}');
          return expect(response).to.have.property('err_code', 0);
        });
        it('should send a multiple valid commands (same module) and receive response', async function () {
          let time = device.apiModuleNamespace.timesetting;
          let response = await device.sendCommand(`{"${time}":{"get_time":{},"get_timezone":{}}}`);
          expect(response[time]).to.have.nested.property('get_time.err_code', 0);
          expect(response[time]).to.have.nested.property('get_timezone.err_code', 0);
        });
        it('should send a multiple valid commands (diff modules) and receive response', async function () {
          let response = await device.sendCommand('{"system":{"get_sysinfo":{}},"netif":{"get_scaninfo":{}}}');
          expect(response).to.have.nested.property('system.get_sysinfo.err_code', 0);
          expect(response).to.have.nested.property('netif.get_scaninfo.err_code', 0);
        });
        it('should send a single invalid command (member) and reject with ResponseError', function () {
          return expect(device.sendCommand('{"system":{"INVALID_MEMBER":{}}}'))
            .to.eventually.be.rejectedWith(ResponseError)
            .and.have.nested.property('response.err_code', -2);
        });
        it('should send a single invalid command (module) and reject with ResponseError', function () {
          return expect(device.sendCommand('{"INVALID_MODULE":{"INVALID_MEMBER":{}}}'))
          .to.eventually.be.rejectedWith(ResponseError)
          .and.have.nested.property('response.err_code', -1);
        });
        it('should send multiple invalid commands and reject with ResponseError', function () {
          let promise = device.sendCommand('{"system":{"INVALID_MEMBER":{}},"INVALID_MODULE":{"INVALID_MEMBER":{}}}');
          return promise.catch((reason) => {
            expect(reason).to.be.an.instanceof(ResponseError);
            expect(reason).to.have.nested.property('response.INVALID_MODULE.err_code', -1);
            expect(reason).to.have.nested.property('response.system.INVALID_MEMBER.err_code', -2);
          });
        });
      });

      describe('#sysInfo get', function () {
        it('should return sysInfo after getSysInfo called', async function () {
          let si = await device.getSysInfo();
          expect(device.sysInfo).to.eql(si);
        });
      });

      describe('#emeterRealtime get', function () {
        it('should return emeterRealtime after getEmeterRealtime called', async function () {
          await device.getSysInfo();
          if (device.supportsEmeter) {
            let er = await device.getEmeterRealtime();
            expect(device.emeterRealtime).to.eql(er);
          } else {
            expect(device.emeterRealtime).to.eql({});
          }
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

      describe('#deviceName get', function () {
        it('should return deviceName from cached sysInfo', function () {
          expect(device.deviceName).to.eql(device.sysInfo.dev_name);
          device.sysInfo.dev_name = 'My Test deviceName';
          expect(device.deviceName).to.eql(device.sysInfo.dev_name);
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
          let generalDevice = client.getCommonDevice(options);
          expect(generalDevice.deviceType).to.equal('device');
        });
        it('should return actual type after querying device', async function () {
          let generalDevice = client.getCommonDevice(options);
          await generalDevice.getSysInfo();
          expect(generalDevice.deviceType).to.eql(deviceType);
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

      describe('#getSysInfo()', function () {
        it('should return info', function () {
          return expect(device.getSysInfo()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#setAlias()', function () {
        this.slow(200);
        this.timeout(4000);
        it('should change the alias', async function () {
          let testAlias = `Testing ${Math.floor(Math.random() * (100 + 1))}`;

          let si = await device.getSysInfo();
          let origAlias = si.alias;
          expect((await device.setAlias(testAlias))).to.be.true;

          si = await device.getSysInfo();
          expect(si.alias).to.equal(testAlias);

          expect((await device.setAlias(origAlias))).to.be.true;
          si = await device.getSysInfo();
          expect(si.alias).to.equal(origAlias);
        });
      });

      describe('#getCloudInfo()', function () {
        it('should return cloud info', async function () {
          let ci = await device.getCloudInfo();
          expect(ci).to.have.property('err_code', 0);
          expect(ci).to.include.keys('username', 'server');
        });
      });

      describe('#getEmeterRealtime()', function () {
        it('should return EmeterRealtime if supported or throw error', async function () {
          await device.getSysInfo();
          if (device.supportsEmeter) {
            return expect(device.getEmeterRealtime()).to.eventually.have.property('err_code', 0);
          } else {
            return expect(device.getEmeterRealtime()).to.eventually.be.rejectedWith(ResponseError);
          }
        });
        it('should emit emeter-realtime-update if supported', async function () {
          await device.getSysInfo();
          if (!device.supportsEmeter) return;

          let spy = sinon.spy();

          device.on('emeter-realtime-update', spy);
          await device.getEmeterRealtime();
          await device.getEmeterRealtime();

          expect(spy).to.be.calledTwice;
          expect(spy).to.be.calledWithMatch({err_code: 0});
        });
      });

      describe('#getModel()', function () {
        it('should return model', function () {
          return expect(device.getModel()).to.eventually.match(/^HS\d\d\d|^LB\d\d\d/);
        });
      });

      describe('#getScanInfo()', function () {
        it('should return get scan info', function () {
          this.timeout(10000);
          this.slow(6000);
          return expect(device.getScanInfo(true, 2)).to.eventually.have.property('err_code', 0);
        });

        it('should return get cached scan info', function () {
          this.slow(1000);
          return expect(device.getScanInfo(false)).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getScheduleNextAction()', function () {
        it('should return schedule next action', function () {
          return expect(device.getScheduleNextAction()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getScheduleRules()', function () {
        it('should return schedule rules', function () {
          return expect(device.getScheduleRules()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getTime()', function () {
        it('should return time', function () {
          return expect(device.getTime()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getTimeZone()', function () {
        it('should return get time zone', function () {
          return expect(device.getTimeZone()).to.eventually.have.property('err_code', 0);
        });
      });
    });
  });
});
