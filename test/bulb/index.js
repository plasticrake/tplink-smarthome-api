/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, testDevices } = require('../setup');

const lightingTests = require('./lighting');
const scheduleTests = require('./schedule');

describe('Bulb', function () {
  this.timeout(5000);
  this.slow(2000);

  testDevices['bulb'].forEach((testDevice) => {
    context(testDevice.name, function () {
      let bulb;
      before(async function () {
        // beforeEach() doesn't work with assigning to `this`
        if (testDevice.getDevice) {
          bulb = await testDevice.getDevice();
          this.device = bulb;
        }
      });
      beforeEach(async function () {
        // before() doesn't skip nested describes
        if (!testDevice.getDevice) {
          return this.skip();
        }
        bulb = await testDevice.getDevice();
        this.device = bulb;
      });

      describe('#supportsBrightness get', function () {
        it('should return is_dimmable from cached sysInfo', function () {
          expect(bulb.supportsBrightness).to.eql(bulb.sysInfo.is_dimmable === 1);

          bulb.sysInfo.is_dimmable = 0;
          expect(bulb.supportsBrightness).to.be.false;
          bulb.sysInfo.is_dimmable = 1;
          expect(bulb.supportsBrightness).to.be.true;
        });
      });

      describe('#supportsColor get', function () {
        it('should return is_color from cached sysInfo', function () {
          expect(bulb.supportsColor).to.eql(bulb.sysInfo.is_color === 1);

          bulb.sysInfo.is_color = 0;
          expect(bulb.supportsColor).to.be.false;
          bulb.sysInfo.is_color = 1;
          expect(bulb.supportsColor).to.be.true;
        });
      });

      describe('#supportsColorTemperature get', function () {
        it('should return is_variable_color_temp from cached sysInfo', function () {
          expect(bulb.supportsColorTemperature).to.eql(bulb.sysInfo.is_variable_color_temp === 1);

          bulb.sysInfo.is_variable_color_temp = 0;
          expect(bulb.supportsColorTemperature).to.be.false;
          bulb.sysInfo.is_variable_color_temp = 1;
          expect(bulb.supportsColorTemperature).to.be.true;
        });
      });

      describe('#getColorTemperatureRange get', function () {
        it('should return is_variable_color_temp from cached sysInfo if supported (LB120/LB130)', function () {
          let range = bulb.getColorTemperatureRange;
          if (bulb.supportsColorTemperature) {
            expect(range).to.to.have.property('min').a('number').within(2500, 9000);
            expect(range).to.to.have.property('max').a('number').within(2500, 9000);

            expect(testDevice.model).to.match(/lb1[23]0/);
            if (testDevice.model === 'lb120') {
              expect(range.min).to.eql(2700);
              expect(range.max).to.eql(6500);
            } else if (testDevice.model === 'lb130') {
              expect(range.min).to.eql(2500);
              expect(range.max).to.eql(9000);
            }
          }
        });
        it('should return undefined if not supported (LB100)', function () {
          let range = bulb.getColorTemperatureRange;
          if (!bulb.supportsColorTemperature) {
            expect(range).to.be.undefined;
            expect(testDevice.model).to.not.match(/lb1[23]0/);
          }
        });
      });

      describe('#getInfo()', function () {
        it('should return info', async function () {
          let results = await bulb.getInfo();
          expect(results).to.have.property('sysInfo');
          expect(results).to.have.nested.property('cloud.info');
          expect(results).to.have.nested.property('emeter.realtime');
          expect(results).to.have.nested.property('schedule.nextAction');
          expect(results).to.have.nested.property('lighting.lightState');
        });
      });

      lightingTests(testDevice);
      scheduleTests(testDevice);

      describe('#setPowerState()', function () {
        it('should turn on', function () {
          return expect(bulb.setPowerState(true)).to.eventually.be.true;
        });

        it('should turn off', function () {
          return expect(bulb.setPowerState(false)).to.eventually.be.true;
        });
      });

      describe('#getPowerState()', function () {
        it('should return power state when on', async function () {
          await bulb.setPowerState(true);
          expect(await bulb.getPowerState()).to.be.true;
        });

        it('should return power state when off', async function () {
          await bulb.setPowerState(false);
          expect(await bulb.getPowerState()).to.be.false;
        });
      });

      describe('#togglePowerState()', function () {
        it('should turn on', async function () {
          expect(await bulb.setPowerState(false)).to.be.true;
          expect(await bulb.togglePowerState()).to.be.true;
          expect(await bulb.getPowerState()).to.be.true;
        });

        it('should turn off', async function () {
          expect(await bulb.setPowerState(true)).to.be.true;
          expect(await bulb.togglePowerState()).to.be.false;
          expect(await bulb.getPowerState()).to.be.false;
        });
      });
    });
  });
});
