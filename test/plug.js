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

const utils = require('../src/utils');
const ResponseError = utils.ResponseError;
const { testDevices } = require('./setup');

describe('Plug', function () {
  before(function () {
    this.timeout(4000);
    this.slow(2000);
  });

  testDevices['plug'].forEach((testPlug) => {
    let plug;
    context(testPlug.name, function () {
      beforeEach(async function () {
        if (!testPlug.getDevice) {
          this.skip();
        }
        plug = await testPlug.getDevice();
      });

      describe('#supportsEmeter', function () {
        it('should be true for hs110 and false for other plugs', function () {
          if (plug.model.match(/^HS110/)) {
            expect(plug.supportsEmeter).to.be.true;
          } else {
            expect(plug.supportsEmeter).to.be.false;
          }
        });
      });

      describe('#inUse get', function () {
        it('should return status based on Emeter if supported', function () {
          if (!plug.supportsEmeter) return;

          plug.inUseThreshold = 0;
          plug.emeterRealtime = {power: 0};
          expect(plug.inUse).to.be.false;

          plug.inUseThreshold = 10;
          plug.emeterRealtime = {power: 10};
          expect(plug.inUse).to.be.false;

          plug.inUseThreshold = 0;
          plug.emeterRealtime = {power: 0.1};
          expect(plug.inUse).to.be.true;

          plug.inUseThreshold = 10;
          plug.emeterRealtime = {power: 11};
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

      describe('#getInUse', function () {
        it('should resolve', function () {
          return expect(plug.getInUse()).to.eventually.be.a('boolean');
        });
      });

      describe('#getInfo()', function () {
        it('should return info', async function () {
          let results = await plug.getInfo();
          expect(results).to.have.property('sysInfo');
          expect(results).to.have.property('cloudInfo');
          expect(results).to.have.property('emeterRealtime');
          expect(results).to.have.property('scheduleNextAction');
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

        it('should emit lightstate-off / power-update', async function () {
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

          expect(spyInUse).to.be.calledOnce;
          expect(spyNotInUse).to.be.calledOnce;
          expect(spyInUseUpdate).to.be.calledTwice;
          expect(spyInUseUpdate).to.be.always.calledWithMatch(sinon.match.bool);
        });
      });

      describe('#getPowerState()', function () {
        this.timeout(2000);
        this.slow(1000);
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

      describe('#getAwayRules()', function () {
        it('should return away rules', function () {
          return expect(plug.getAwayRules()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#getTimerRules()', function () {
        it('should return timer rules', function () {
          return expect(plug.getTimerRules()).to.eventually.have.property('err_code', 0);
        });
      });

      describe('#addTimerRule()', function () {
        it('should add timer rule', async function () {
          let response = await plug.addTimerRule({delay: 20, powerState: false});
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('id').that.is.a('string');

          let id = response.id;
          let rules = await plug.getTimerRules();
          expect(rules.rule_list[0].id).to.eql(id);
        });

        it('should delete existing rules and add timer rule when deleteExisting is true', async function () {
          await plug.addTimerRule({delay: 20, powerState: false, deleteExisting: true});

          let response = await plug.addTimerRule({delay: 50, powerState: false, deleteExisting: true});
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('id').that.is.a('string');
        });

        it('should fail if a timer rule exists when deleteExisting is false', async function () {
          await plug.addTimerRule({delay: 20, powerState: false, deleteExisting: true});
          return expect(plug.addTimerRule({delay: 20, powerState: false, deleteExisting: false})).to.eventually.be.rejectedWith(ResponseError);
        });
      });

      describe('#editTimerRule()', function () {
        it('should edit timer rule', async function () {
          let response = await plug.addTimerRule({delay: 20, powerState: false});
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('id').that.is.a('string');

          let id = response.id;

          await plug.editTimerRule({id, delay: 50, powerStart: false});

          let rules = await plug.getTimerRules();
          expect(rules.rule_list[0].id).to.eql(id);
          expect(rules.rule_list[0].delay).to.eql(50);
        });
      });

      describe('#deleteAllTimerRules()', function () {
        it('should delete timer rules', function () {
          return expect(plug.deleteAllTimerRules()).to.eventually.have.property('err_code', 0);
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
        this.slow(300);
        it('should blink LED', async function () {
          expect(await plug.blink(2, 100)).to.be.true;
        });
      });
    });
  });
});
