const {
  expect,
  getTestClient,
  testDevices,
  testDeviceCleanup,
  testSendOptionsSets,
} = require('./setup');

const Client = require('../src/client');
const Device = require('../src/device');

after(function() {
  testDeviceCleanup();
});

describe('Test Environment Setup', function() {
  describe('getTestClient()', function() {
    it('should return Client', function() {
      const client = getTestClient();
      expect(client).to.be.instanceOf(Client);
    });
  });

  function deviceIsOk(testDevice) {
    it('should have a device', function() {
      expect(testDevice.getDevice).to.exist.and.be.an.instanceof(Function);
      return expect(
        testDevice.getDevice()
      ).to.eventually.exist.and.be.an.instanceof(Device);
    });
    it('should have deviceOptions', function() {
      expect(testDevice.deviceOptions).to.exist.and.to.contain.keys(
        'host',
        'port'
      );
    });
    describe('getTestClient()', function() {
      testSendOptionsSets.forEach(testSendOptions => {
        context(testSendOptions.name, function() {
          it('should create device with sendOptions', async function() {
            const tso = { ...testSendOptions };
            delete tso.name;
            const device = await testDevice.getDevice(null, tso);
            expect(device.defaultSendOptions).to.containSubset(tso);
          });
        });
      });
    });
  }

  describe('testDevices', function() {
    testDevices.forEach(testDevice => {
      context(testDevice.name, function() {
        deviceIsOk(testDevice);
      });
    });

    ['anyDevice', 'anyPlug', 'anyBulb'].forEach(deviceKey => {
      context(deviceKey, function() {
        deviceIsOk(testDevices[deviceKey]);
      });
    });

    ['plugChildren'].forEach(deviceKey => {
      context(deviceKey, function() {
        it('should be an array with at least one item', function() {
          expect(testDevices[deviceKey].length).to.be.above(0);
        });
        testDevices[deviceKey].forEach(d => {
          deviceIsOk(d);

          it('should have childId', function() {
            expect(d).to.have.property('childId');
          });
        });
      });
    });

    context('unreliable', function() {
      let testDevice;
      before(function() {
        testDevice = testDevices.unreliable;
      });
      it('should have deviceOptions', function() {
        expect(testDevice).to.have.property('deviceOptions');
        expect(testDevice.deviceOptions).to.contain.keys('host', 'port');
      });
      testSendOptionsSets.forEach(testSendOptions => {
        context(testSendOptions.name, function() {
          it('should have getDevice and throw', function() {
            expect(testDevice.getDevice).to.exist.and.be.an.instanceof(
              Function
            );
            return expect(
              testDevice.getDevice(null, testSendOptions)
            ).to.eventually.be.rejected;
          });
        });
      });
    });
    context('unreachable', function() {
      it('should have deviceOptions', function() {
        expect(testDevices.unreachable).to.have.property('deviceOptions');
        expect(testDevices.unreachable.deviceOptions).to.contain.keys(
          'host',
          'port'
        );
      });
    });
  });
});
