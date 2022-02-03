import assert from 'assert';
import sinon from 'sinon';

import type { Bulb } from '../../src';
import { AnyDevice } from '../../src/client';

import { config, expect, retry, testDevices } from '../setup';

import lightingTests from './lighting';
import scheduleTests from './schedule';

describe('Bulb', function () {
  this.timeout(config.defaultTestTimeout);
  this.slow(config.defaultTestTimeout / 2);
  this.retries(1);

  config.testSendOptionsSets.forEach((testSendOptions) => {
    context(testSendOptions.name, function () {
      testDevices.bulb.forEach((testDevice) => {
        context(testDevice.name, function () {
          const ctx: { device?: AnyDevice } = {};
          let bulb: Bulb;

          before('Bulb', async function () {
            if (!testDevice.getDevice) {
              this.skip();
            }
          });

          beforeEach('Bulb', async function () {
            // before() doesn't skip nested describes
            if (!testDevice.getDevice) {
              this.skip();
            }
            await retry(async () => {
              // this is in beforeEach since many of the tests may overwrite some properties
              bulb = (await testDevice.getDevice(
                undefined,
                testSendOptions
              )) as Bulb;
              ctx.device = bulb;
            }, 2);
          });

          describe('#supportsBrightness get', function () {
            it('should return is_dimmable from cached sysInfo', function () {
              expect(bulb.supportsBrightness).to.eql(
                bulb.sysInfo.is_dimmable === 1
              );

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
              expect(bulb.supportsColorTemperature).to.eql(
                bulb.sysInfo.is_variable_color_temp === 1
              );

              bulb.sysInfo.is_variable_color_temp = 0;
              expect(bulb.supportsColorTemperature).to.be.false;
              bulb.sysInfo.is_variable_color_temp = 1;
              expect(bulb.supportsColorTemperature).to.be.true;
            });
          });

          describe('#colorTemperatureRange get', function () {
            it('should return is_variable_color_temp from cached sysInfo if supported (LB120/LB130/KL430)', function () {
              const range = bulb.colorTemperatureRange;
              if (bulb.supportsColorTemperature) {
                expect(range)
                  .to.have.property('min')
                  .a('number')
                  .within(2500, 9000);
                expect(range)
                  .to.have.property('max')
                  .a('number')
                  .within(2500, 9000);

                assert(range != null);

                expect(testDevice.model).to.match(/lb1[23]0|kl430/);
                if (testDevice.model === 'lb120') {
                  expect(range.min).to.eql(2700);
                  expect(range.max).to.eql(6500);
                } else if (testDevice.model === 'lb130') {
                  expect(range.min).to.eql(2500);
                  expect(range.max).to.eql(9000);
                } else if (testDevice.model === 'kl430') {
                  expect(range.min).to.eql(2500);
                  expect(range.max).to.eql(9000);
                }
              }
            });
            it('should return null if not supported (LB100)', function () {
              const range = bulb.colorTemperatureRange;
              if (!bulb.supportsColorTemperature) {
                expect(range).to.be.null;
                expect(testDevice.model).to.not.match(/lb1[23]0/);
              }
            });
          });

          describe('#getInfo()', function () {
            it('should return info', async function () {
              const results = await bulb.getInfo();
              expect(results).to.have.property('sysInfo');
              expect(results).to.have.nested.property('cloud.info');
              expect(results).to.have.nested.property('emeter.realtime');
              expect(results).to.have.nested.property('schedule.nextAction');
              expect(results).to.have.nested.property('lighting.lightState');
            });
          });

          lightingTests(ctx);

          if (testDevice.supports == null || testDevice.supports.schedule) {
            scheduleTests(ctx, testDevice);
          }

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

          describe('#getSysInfo()', function () {
            it('should emit lightstate-sysinfo-on / lightstate-sysinfo-update', async function () {
              const spy = sinon.spy();
              const spyPowerUpdate = sinon.spy();

              await bulb.lighting.setLightState({ on_off: 0 });
              await bulb.getSysInfo();

              bulb.on('lightstate-sysinfo-on', spy);
              bulb.on('lightstate-sysinfo-update', spyPowerUpdate);
              await bulb.getSysInfo();
              await bulb.lighting.setLightState({ on_off: 1 });
              await bulb.getSysInfo();
              await bulb.getSysInfo();

              expect(spy).to.be.calledOnce;
              expect(spyPowerUpdate).to.be.calledThrice;
            });

            it('should emit lightstate-sysinfo-off / lightstate-sysinfo-update', async function () {
              const spy = sinon.spy();
              const spyPowerUpdate = sinon.spy();

              await bulb.lighting.setLightState({ on_off: 1 });
              await bulb.getSysInfo();

              bulb.on('lightstate-sysinfo-off', spy);
              bulb.on('lightstate-sysinfo-update', spyPowerUpdate);
              await bulb.getSysInfo();
              await bulb.lighting.setLightState({ on_off: 0 });
              await bulb.getSysInfo();
              await bulb.getSysInfo();

              expect(spy).to.be.calledOnce;
              expect(spyPowerUpdate).to.be.calledThrice;
            });
          });
        });
      });
    });
  });
});
