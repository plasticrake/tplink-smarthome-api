/* eslint-env mocha */
/* global testDevices getTestClient */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

const rewire = require('rewire');

const Hs100Api = require('../src');
const Device = rewire('../src/device');
const util = require('../src/utils');
const ResponseError = util.ResponseError;

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
    });
  });

  testDevices.forEach((testDevice) => {
    let device;
    let options;
    context(testDevice.name, function () {
      beforeEach(function () {
        if (!testDevice.device) {
          this.skip();
        }
        device = testDevice.device;
        options = testDevice.options;
      });

      describe('constructor', function () {
        it('inherit timeout from Client', function () {
          let timeout = 9999;
          let client = new Hs100Api.Client({timeout: timeout});
          let anotherDevice = client.getDeviceFromType(device.type);
          expect(client.timeout).to.equal(timeout);
          expect(anotherDevice.timeout).to.equal(timeout);
        });
      });

      describe('#type', function () {
        it('should return type of "device" before querying device', function () {
          let generalDevice = client.getGeneralDevice(options);
          expect(generalDevice.type).to.equal('device');
        });
        it('should return actual type after querying device', async function () {
          let generalDevice = client.getGeneralDevice(options);
          await generalDevice.getSysInfo();
          if (device.testType === 'device') {
            expect(generalDevice.type).to.be.oneOf(['plug', 'bulb']);
          } else {
            expect(generalDevice.type).to.eql(device.type);
          }
        });
      });

      describe('#getSysInfo()', function () {
        it('should return info', function () {
          return expect(device.getSysInfo()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getModel()', function () {
        it('should return model', function () {
          return expect(device.getModel()).to.eventually.match(/^HS\d\d\d|^LB\d\d\d/);
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

      describe('#getConsumption()', function () {
        it('should return consumption if supported or throw error', async function () {
          await device.getSysInfo();
          if (device.supportsConsumption) {
            return expect(device.getConsumption()).to.eventually.have.property('err_code', 0);
          } else {
            return expect(device.getConsumption()).to.eventually.be.rejectedWith();
          }
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
    });
  });
});
