/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { config, expect, retry, testDevices } = require('../setup');

const awayTests = require('./away');
const dimmerTests = require('./dimmer');
const scheduleTests = require('./schedule');
const timerTests = require('./timer');

describe('Plug', function () {
  this.timeout(config.defaultTestTimeout);
  this.slow(config.defaultTestTimeout / 2);

  config.testSendOptionsSets.forEach((testSendOptions) => {
    context(testSendOptions.name, function () {
      testDevices.plug.forEach((testDevice) => {
        if (testDevice.model !== 'hs300') return;

        context(`${testDevice.name} children`, function () {
          this.retries(0); // retries break the children pre state check

          beforeEach('plug children', async function () {
            // before() doesn't skip nested describes
            if (!testDevice.getDevice) this.skip();

            // otherChildrenPreState = await testDevice.getOtherChildrenState();
          });

          // afterEach(async function () {
          //   const currentState = await testDevice.getOtherChildrenState();
          //   expect(currentState).to.eql(otherChildrenPreState);
          // });

          async function eachChild(fn) {
            for (const child of testDevice.children) {
              // eslint-disable-next-line no-await-in-loop
              const otherChildrenPreState = await child.getOtherChildrenState();
              // eslint-disable-next-line no-await-in-loop
              const childPlug = await child.getDevice(
                undefined,
                testSendOptions
              );
              // eslint-disable-next-line no-await-in-loop
              await fn(childPlug);
              // eslint-disable-next-line no-await-in-loop
              const currentState = await child.getOtherChildrenState();
              expect(currentState).to.eql(otherChildrenPreState);
            }
          }

          describe('#setAlias()', function () {
            it('should change the alias and not affect other children', async function () {
              this.timeout(config.defaultTestTimeout * 4);

              await eachChild(async (childPlug) => {
                // Get original value
                await childPlug.getSysInfo();
                const origAlias = childPlug.alias;

                const testAlias = `Testing ${Math.floor(
                  Math.random() * (100 + 1)
                )}`;
                expect(await childPlug.setAlias(testAlias)).to.be.true;
                await childPlug.getSysInfo();
                expect(childPlug.alias).to.equal(testAlias);

                // Set back to original value
                expect(await childPlug.setAlias(origAlias)).to.be.true;
                await childPlug.getSysInfo();
                expect(childPlug.alias).to.equal(origAlias);
              });
            });
          });

          describe('#setPowerState()', function () {
            it('should turn on child plug and not affect other children', async function () {
              this.timeout(config.defaultTestTimeout * 2);

              await eachChild(async (childPlug) => {
                expect(await childPlug.setPowerState(true), 'set return true')
                  .to.be.true;
                expect(await childPlug.getPowerState()).to.be.true;
              });
            });

            it('should turn off child plug and not affect other children', async function () {
              this.timeout(config.defaultTestTimeout * 2);

              await eachChild(async (childPlug) => {
                expect(await childPlug.setPowerState(false), 'set return true')
                  .to.be.true;
                expect(await childPlug.getPowerState()).to.be.false;
              });
            });
          });
        });
      });

      testDevices.plug.forEach((testDevice) => {
        context(testDevice.name, function () {
          this.retries(1);
          let plug;
          const ctx = {};

          before('plug', async function () {
            this.timeout(20000);
            if (!('getDevice' in testDevice)) this.skip();

            await retry(async () => {
              plug = await testDevice.getDevice(undefined, testSendOptions);
              ctx.device = plug;
            }, 2);
          });

          beforeEach('plug', async function () {
            // before() doesn't skip nested describes
            if (!('getDevice' in testDevice)) this.skip();
          });

          describe('#supportsEmeter', function () {
            it('should be true for hs110, hs300 and false for other plugs', function () {
              if (plug.model.match(/^HS(110|300)/)) {
                expect(plug.supportsEmeter).to.be.true;
              } else {
                expect(plug.supportsEmeter).to.be.false;
              }
            });
          });

          describe('#id get', function () {
            it('should return a deviceId', function () {
              if (plug.childId != null) this.skip();
              expect(plug.id).to.eql(plug.sysInfo.deviceId);
            });
            it('should return a childId if set and supported', function () {
              if (plug.childId == null) this.skip();
              expect(plug.id).to.eql(plug.childId);
            });
          });

          describe('#inUse get', function () {
            it('should return status based on Emeter if supported', function () {
              if (!plug.supportsEmeter) return;

              plug.inUseThreshold = 0;
              plug.emeter.realtime = { power: 0 };
              expect(plug.inUse).to.be.false;

              plug.inUseThreshold = 10;
              plug.emeter.realtime = { power: 10 };
              expect(plug.inUse).to.be.false;

              plug.inUseThreshold = 0;
              plug.emeter.realtime = { power: 0.1 };
              expect(plug.inUse).to.be.true;

              plug.inUseThreshold = 10;
              plug.emeter.realtime = { power: 11 };
              expect(plug.inUse).to.be.true;
            });
            it('should return status based on relay_state if Emeter not supported', function () {
              if (plug.supportsEmeter) return;

              plug.sysInfo.relay_state = 0;
              expect(plug.inUse).to.be.false;

              plug.sysInfo.relay_state = 1;
              expect(plug.inUse).to.be.true;
            });
          });

          describe('#relayState get', function () {
            it('should return a boolean', function () {
              expect(plug.relayState).to.be.a('boolean');
            });
          });

          describe('#supportsDimmer get', function () {
            it('should return true for HS220', function () {
              if (plug.sysInfo.model.includes('HS220')) {
                expect(plug.supportsDimmer).to.be.true;
              } else {
                this.skip();
              }
            });
            it('should return false for non HS220', function () {
              if (!plug.sysInfo.model.includes('HS220')) {
                expect(plug.supportsDimmer).to.be.false;
              } else {
                this.skip();
              }
            });
          });

          describe('#getInUse', function () {
            it('should resolve', function () {
              return expect(plug.getInUse()).to.eventually.be.a('boolean');
            });
          });

          describe('#getInfo()', function () {
            it('should return info', async function () {
              const results = await plug.getInfo();
              expect(results).to.have.property('sysInfo');
              expect(results).to.have.nested.property('cloud.info');
              expect(results).to.have.nested.property('emeter.realtime');
              expect(results).to.have.nested.property('schedule.nextAction');
            });
          });

          describe('#setPowerState()', function () {
            it('should turn on', async function () {
              expect(await plug.setPowerState(true)).to.be.true;
              expect(await plug.getPowerState()).to.be.true;
            });

            it('should turn off', async function () {
              expect(await plug.setPowerState(false)).to.be.true;
              expect(await plug.getPowerState()).to.be.false;
            });

            it('should emit power-on / power-update', async function () {
              const spy = sinon.spy();
              const spyPowerUpdate = sinon.spy();

              plug.on('power-on', spy);
              plug.on('power-update', spyPowerUpdate);
              await plug.setPowerState(false);
              await plug.setPowerState(true);

              expect(spy).to.be.calledOnce;
              expect(spyPowerUpdate).to.be.calledTwice;
              expect(spyPowerUpdate).to.be.always.calledWithMatch(
                sinon.match.bool
              );
            });

            it('should emit power-off / power-update', async function () {
              const spy = sinon.spy();
              const spyPowerUpdate = sinon.spy();

              plug.on('power-off', spy);
              plug.on('power-update', spyPowerUpdate);
              await plug.setPowerState(true);
              await plug.setPowerState(false);

              expect(spy).to.be.calledOnce;
              expect(spyPowerUpdate).to.be.calledTwice;
              expect(spyPowerUpdate).to.be.always.calledWithMatch(
                sinon.match.bool
              );
            });

            it('should emit in-use / not-in-use / in-use-update for plugs without Emeter support', async function () {
              if (plug.supportsEmeter) return;
              const spyInUse = sinon.spy();
              const spyNotInUse = sinon.spy();
              const spyInUseUpdate = sinon.spy();

              plug.on('in-use', spyInUse);
              plug.on('not-in-use', spyNotInUse);
              plug.on('in-use-update', spyInUseUpdate);

              await plug.setPowerState(false);
              await plug.setPowerState(true);
              await plug.setPowerState(false);

              expect(spyInUse, 'in-use').to.be.calledOnce;
              expect(spyNotInUse, 'not-in-use').to.be.calledOnce;
              expect(spyInUseUpdate, 'in-use-update').to.be.calledThrice;
              expect(
                spyInUseUpdate,
                'in-use-update'
              ).to.be.always.calledWithMatch(sinon.match.bool);
            });
          });

          describe('#getPowerState()', function () {
            it('should return power state when on', async function () {
              expect(await plug.setPowerState(true)).to.be.true;
              expect(await plug.getPowerState()).to.be.true;
            });

            it('should return power state when off', async function () {
              expect(await plug.setPowerState(false)).to.be.true;
              expect(await plug.getPowerState()).to.be.false;
            });

            it('should emit power-update', async function () {
              const spy = sinon.spy();

              plug.on('power-update', spy);
              await plug.getPowerState();
              await plug.getPowerState();

              expect(spy).to.be.calledTwice;
            });

            it('should emit in-use-update for plugs without Emeter support', async function () {
              if (plug.supportsEmeter) return;
              const spyInUseUpdate = sinon.spy();

              await plug.setPowerState(false);

              plug.on('in-use-update', spyInUseUpdate);

              await plug.getPowerState();
              await plug.getPowerState();

              expect(spyInUseUpdate).to.be.calledTwice;
              expect(spyInUseUpdate).to.be.always.calledWithMatch(
                sinon.match.bool
              );
            });
          });

          describe('#togglePowerState()', function () {
            it('should turn on', async function () {
              expect(await plug.setPowerState(false)).to.be.true;
              expect(await plug.togglePowerState()).to.be.true;
              expect(await plug.getPowerState()).to.be.true;
            });

            it('should turn off', async function () {
              expect(await plug.setPowerState(true)).to.be.true;
              expect(await plug.togglePowerState()).to.be.false;
              expect(await plug.getPowerState()).to.be.false;
            });
          });

          describe('#setLedState()', function () {
            it('should turn LED off', async function () {
              expect(await plug.setLedState(false)).to.be.true;
            });

            it('should turn LED on', async function () {
              expect(await plug.setLedState(true)).to.be.true;
            });
          });

          describe('#getLedState()', function () {
            it('should return LED state when off', async function () {
              await plug.setLedState(false);
              expect(await plug.getLedState()).to.be.false;
            });

            it('should return LED state when on', async function () {
              await plug.setLedState(true);
              expect(await plug.getLedState()).to.be.true;
            });
          });

          describe('#blink()', function () {
            it('should blink LED', async function () {
              expect(await plug.blink(2, 100)).to.be.true;
            });
          });

          awayTests(ctx, testDevice);
          if (testDevice.model === 'hs220') {
            dimmerTests(ctx, testDevice);
          }
          scheduleTests(ctx, testDevice);
          timerTests(ctx, testDevice);
        });
      });
    });
  });
});
