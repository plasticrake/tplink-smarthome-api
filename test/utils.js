const { expect } = require('./setup');

const { compareMac, processResponse, ResponseError } = require('../src/utils');

const compareMacTests = [
  {
    mac: '',
    pattern: '',
    expected: true,
  },
  {
    mac: 'aabbcc001122',
    pattern: '',
    expected: false,
  },
  {
    mac: '',
    pattern: 'aabbcc001122',
    expected: false,
  },
  {
    mac: 'aabbcc001122',
    pattern: 'aabbcc001122',
    expected: true,
  },
  {
    mac: 'AA:bbcc001122',
    pattern: 'aaBB:cc:??:??:??',
    expected: true,
  },
  {
    mac: 'aabbcc001122',
    pattern: '001122aabbcc',
    expected: false,
  },
  {
    mac: 'aabbcc001122',
    pattern: '????????????',
    expected: true,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: 'b*:??:??:??:??:??',
    expected: false,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: '??:??:??:??:??:*2',
    expected: true,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: '*2',
    expected: true,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: 'a*',
    expected: true,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: '*0',
    expected: false,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: 'b*',
    expected: false,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: ['b', 'c', 'aa:bb:cc:00:11:22'],
    expected: true,
  },
  {
    mac: 'aa:bb:cc:00:11:22',
    pattern: ['b', 'c', 'd'],
    expected: false,
  },
];

describe('Utils', function () {
  describe('.compareMac()', function () {
    compareMacTests.forEach(function (test, i) {
      it(`should return ${test.expected} for test ${i + 1}`, function () {
        const result = compareMac(test.mac, test.pattern);
        expect(result).to.eql(test.expected);
      });
    });
  });

  describe('.processResponse()', function () {
    it('return fragment for single command emeter.get_realtime', function () {
      const command = { emeter: { get_realtime: {} } };
      const response = {
        emeter: {
          get_realtime: {
            current: 0.012933,
            voltage: 120.793324,
            power: 0,
            total: 0.001,
            err_code: 0,
          },
        },
      };
      const pr = processResponse(command, response);
      expect(pr).to.have.keys(
        'current',
        'voltage',
        'power',
        'total',
        'err_code'
      );
    });

    it('to throw ResponseError for single command emeter.get_realtime not supported', function () {
      const command = { emeter: { get_realtime: {} } };
      const response = {
        emeter: { err_code: -1, err_msg: 'module not support' },
      };
      expect(() => processResponse(command, response))
        .to.throw(ResponseError)
        .deep.includes({
          response: JSON.stringify({
            err_code: -1,
            err_msg: 'module not support',
          }),
          modules: ['emeter'],
          methods: [],
        });
    });

    it('return fragment for single command system.set_dev_alias', function () {
      const command = { system: { set_dev_alias: { alias: 'New Alias' } } };
      const response = { system: { set_dev_alias: { err_code: 0 } } };
      const pr = processResponse(command, response);
      expect(pr).to.have.property('err_code', 0);
    });

    it('return fragment for single command netif.get_scaninfo', function () {
      const command = { netif: { get_scaninfo: { refresh: 1, timeout: 3 } } };
      const response = {
        netif: {
          get_scaninfo: {
            ap_list: [
              { ssid: 'wifi_network_1', key_type: 1 },
              { ssid: 'wifi_network_2', key_type: 2 },
              { ssid: 'wifi_network_3', key_type: 3 },
            ],
            err_code: 0,
          },
        },
      };
      const pr = processResponse(command, response);
      expect(pr).to.have.property('err_code', 0);
      expect(pr).to.have.property('ap_list');
    });

    it('return whole result for multiple commands emeter.get_realtime system.get_sysinfo', function () {
      const command = {
        emeter: { get_realtime: {} },
        system: { get_sysinfo: {} },
      };
      const response = {
        emeter: {
          get_realtime: {
            current: 0.01257,
            voltage: 121.162244,
            power: 0,
            total: 0.001,
            err_code: 0,
          },
        },
        system: {
          get_sysinfo: {
            err_code: 0,
            sw_ver: '1.0.8 Build 151113 Rel.24658',
            hw_ver: '1.0',
            type: 'IOT.SMARTPLUGSWITCH',
            model: 'HS110(US)',
            mac: '00:00:00:00:00:00',
            deviceId: '1234',
            hwId: '1234',
            fwId: '1234',
            oemId: '1234',
            alias: 'sup',
            dev_name: 'Wi-Fi Smart Plug With Energy Monitoring',
            icon_hash: '',
            relay_state: 0,
            on_time: 0,
            active_mode: 'schedule',
            feature: 'TIM:ENE',
            updating: 0,
            rssi: -63,
            led_off: 0,
            latitude: 0.0,
            longitude: 0.0,
          },
        },
      };
      const pr = processResponse(command, response);
      expect(pr).to.have.keys('emeter', 'system');
      expect(pr.emeter.get_realtime).to.have.keys(
        'current',
        'voltage',
        'power',
        'total',
        'err_code'
      );
      expect(pr.system.get_sysinfo).to.include.keys(
        'err_code',
        'sw_ver',
        'hw_ver',
        'type'
      );
    });

    it('to throw ResponseError including whole result for multiple commands emeter.get_realtime system.get_sysinfo', function () {
      const command = {
        emeter: { get_realtime: {} },
        system: { get_sysinfo: {} },
      };
      const response = {
        emeter: { err_code: -1, err_msg: 'module not support' },
        system: {
          get_sysinfo: {
            err_code: 0,
            sw_ver: '1.0.8 Build 151113 Rel.24658',
            hw_ver: '1.0',
            type: 'IOT.SMARTPLUGSWITCH',
            model: 'HS110(US)',
            mac: '00:00:00:00:00:00',
            deviceId: '1234',
            hwId: '1234',
            fwId: '1234',
            oemId: '1234',
            alias: 'sup',
            dev_name: 'Wi-Fi Smart Plug With Energy Monitoring',
            icon_hash: '',
            relay_state: 0,
            on_time: 0,
            active_mode: 'schedule',
            feature: 'TIM:ENE',
            updating: 0,
            rssi: -63,
            led_off: 0,
            latitude: 0.0,
            longitude: 0.0,
          },
        },
      };
      expect(() => processResponse(command, response))
        .to.throw(ResponseError)
        .deep.includes({
          response: JSON.stringify(response),
          modules: ['emeter'],
          methods: [],
        });
    });

    it('to throw ResponseError when err_code missing', function () {
      const command = { emeter: { get_realtime: {} } };
      const response = { emeter: { get_realtime: {} } };
      expect(() => processResponse(command, response)).to.throw(
        ResponseError,
        'err_code missing'
      );
    });
  });
});
