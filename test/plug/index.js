/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, sinon, testDevices } = require('../setup');

const awayTests = require('./away');
const dimmerTests = require('./dimmer');
const scheduleTests = require('./schedule');
const timerTests = require('./timer');

describe('Plug', function () {
  this.timeout(5000);
  this.slow(2000);
  this.retries(2);

  testDevices['plugchildren'].forEach((testDevice) => {
    context(testDevice.name, function () {
      let plug;
      let otherChildrenPreState;
      before(async function () {
        // beforeEach() doesn't work with assigning to `this`
        if (testDevice.getDevice) {
          plug = await testDevice.getDevice();
          this.device = plug;
        }
      });
      beforeEach(async function () {
        // before() doesn't skip nested describes
        if (!testDevice.getDevice) {
          return this.skip();
        }
        plug = await testDevice.getDevice();
        this.device = plug;

        otherChildrenPreState = await testDevice.getOtherChildrenState();
      });

      afterEach(async function () {
        const currentState = await testDevice.getOtherChildrenState();
        expect(currentState).to.eql(otherChildrenPreState);
      });

      describe('#setAlias()', function () {
        let origAlias;
        before(async function () {
          if (!testDevice.getDevice) return;
          await plug.getSysInfo();
          origAlias = plug.alias;
        });
        after(async function () {
          if (!testDevice.getDevice) return;
          expect((await plug.setAlias(origAlias))).to.be.true;
          await plug.getSysInfo();
          expect(plug.alias).to.equal(origAlias);
        });

        it('should change the alias and not affect other children', async function () {
          let testAlias = `Testing ${Math.floor(Math.random() * (100 + 1))}`;
          expect((await plug.setAlias(testAlias))).to.be.true;
          await plug.getSysInfo();
          expect(plug.alias).to.equal(testAlias);
        });
      });

      describe('#setPowerState()', function () {
        it('should turn on child plug and not affect other children', async function () {
          expect(await plug.setPowerState(true)).to.be.true;
          expect(await plug.getPowerState()).to.be.true;
        });

        it('should turn off child plug and not affect other children', async function () {
          expect(await plug.setPowerState(false)).to.be.true;
          expect(await plug.getPowerState()).to.be.false;
        });
      });
    });
  });

  testDevices['plug'].forEach((testDevice) => {
    context(testDevice.name, function () {
      let plug;
      before(async function () {
        // beforeEach() doesn't work with assigning to `this`
        if (testDevice.getDevice) {
          plug = await testDevice.getDevice();
          this.device = plug;
        }
      });
      beforeEach(async function () {
        // before() doesn't skip nested describes
        if (!testDevice.getDevice) {
          return this.skip();
        }
        plug = await testDevice.getDevice();
        this.device = plug;
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
          let results = await plug.getInfo();
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
          let spy = sinon.spy();
          let spyPowerUpdate = sinon.spy();

          plug.on('power-on', spy);
          plug.on('power-update', spyPowerUpdate);
          await plug.setPowerState(false);
          await plug.setPowerState(true);

          expect(spy).to.be.calledOnce;
          expect(spyPowerUpdate).to.be.calledTwice;
          expect(spyPowerUpdate).to.be.always.calledWithMatch(sinon.match.bool);
        });

        it('should emit power-off / power-update', async function () {
          let spy = sinon.spy();
          let spyPowerUpdate = sinon.spy();

          plug.on('power-off', spy);
          plug.on('power-update', spyPowerUpdate);
          await plug.setPowerState(true);
          await plug.setPowerState(false);

          expect(spy).to.be.calledOnce;
          expect(spyPowerUpdate).to.be.calledTwice;
          expect(spyPowerUpdate).to.be.always.calledWithMatch(sinon.match.bool);
        });

        it('should emit in-use / not-in-use / in-use-update for plugs without Emeter support', async function () {
          if (plug.supportsEmeter) return;
          let spyInUse = sinon.spy();
          let spyNotInUse = sinon.spy();
          let spyInUseUpdate = sinon.spy();

          plug.on('in-use', spyInUse);
          plug.on('not-in-use', spyNotInUse);
          plug.on('in-use-update', spyInUseUpdate);

          await plug.setPowerState(false);
          await plug.setPowerState(true);
          await plug.setPowerState(false);

          expect(spyInUse, 'in-use').to.be.calledOnce;
          expect(spyNotInUse, 'not-in-use').to.be.calledOnce;
          expect(spyInUseUpdate, 'in-use-update').to.be.calledThrice;
          expect(spyInUseUpdate, 'in-use-update').to.be.always.calledWithMatch(sinon.match.bool);
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
          let spy = sinon.spy();

          plug.on('power-update', spy);
          await plug.getPowerState();
          await plug.getPowerState();

          expect(spy).to.be.calledTwice;
        });

        it('should emit in-use-update for plugs without Emeter support', async function () {
          if (plug.supportsEmeter) return;
          let spyInUseUpdate = sinon.spy();

          await plug.setPowerState(false);

          plug.on('in-use-update', spyInUseUpdate);

          await plug.getPowerState();
          await plug.getPowerState();

          expect(spyInUseUpdate).to.be.calledTwice;
          expect(spyInUseUpdate).to.be.always.calledWithMatch(sinon.match.bool);
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
        this.timeout(5000);
        this.slow(3000);
        it('should blink LED', async function () {
          expect(await plug.blink(2, 100)).to.be.true;
        });
      });

      awayTests(testDevice);
      if (testDevice.model === 'hs220') {
        dimmerTests(testDevice);
      }
      scheduleTests(testDevice);
      timerTests(testDevice);
    });
  });
});
