const sinon = require('sinon');

const {
  config,
  expect,
  getTestClient,
  testDevices,
  useSimulator,
} = require('./setup');

const { default: Client } = require('../src/client');

const Device = require('../src/device').default;

if (useSimulator) this.retry(1);

describe('Test Environment Setup', function () {
  describe('getTestClient()', function () {
    it('should return Client', function () {
      const client = getTestClient();
      expect(client).to.be.instanceOf(Client);
    });
  });

  function deviceIsOk(contextName, testDevice) {
    context(contextName, function () {
      it('should have a device', function () {
        expect(testDevice.getDevice, 'function').to.exist.and.be.an.instanceof(
          Function
        );
        return expect(
          testDevice.getDevice()
        ).to.eventually.exist.and.be.an.instanceof(Device);
      });
      it('should have deviceOptions', function () {
        expect(testDevice.deviceOptions).to.exist.and.to.contain.keys(
          'host',
          'port'
        );
      });
      describe('getTestClient()', function () {
        config.testSendOptionsSets.forEach(function (testSendOptions) {
          context(testSendOptions.name, function () {
            it('should create device with sendOptions', async function () {
              const tso = { ...testSendOptions };
              delete tso.name;
              const device = await testDevice.getDevice(undefined, tso);
              expect(device.defaultSendOptions).to.containSubset(tso);
            });
          });
        });
      });
    });
  }

  describe('testDevices', function () {
    testDevices.devices.forEach(function (testDevice) {
      deviceIsOk(testDevice.name, testDevice);
    });

    ['anyDevice', 'anyPlug', 'anyBulb'].forEach((deviceKey) => {
      deviceIsOk(deviceKey, testDevices[deviceKey]);
    });

    ['plugWithChildren'].forEach((deviceKey) => {
      deviceIsOk(deviceKey, testDevices[deviceKey]);

      context('children', function () {
        it('should be an array with at least one item', function () {
          expect(testDevices[deviceKey].children.length).to.be.above(0);
        });
      });

      it('should be an array with at least one item', function () {
        testDevices[deviceKey].children.forEach((d) => {
          deviceIsOk(deviceKey, d);

          expect(d, 'should have childId').to.have.property('childId');
        });
      });
    });

    context('unreliable', function () {
      let testDevice;
      before(function () {
        testDevice = testDevices.unreliable;
      });
      it('should have deviceOptions', function () {
        expect(testDevice).to.have.property('deviceOptions');
        expect(testDevice.deviceOptions).to.contain.keys('host', 'port');
      });
      config.testSendOptionsSets.forEach((testSendOptions) => {
        context(testSendOptions.name, function () {
          it('should have getDevice and throw', function () {
            expect(testDevice.getDevice).to.exist.and.be.an.instanceof(
              Function
            );
            return expect(
              testDevice.getDevice(undefined, testSendOptions)
            ).to.eventually.be.rejected;
          });
        });
      });
    });

    context('unreachable', function () {
      it('should have deviceOptions', function () {
        expect(testDevices.unreachable).to.have.property('deviceOptions');
        expect(testDevices.unreachable.deviceOptions).to.contain.keys(
          'host',
          'port'
        );
      });
    });
  });
});

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});
