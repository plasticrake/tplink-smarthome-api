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

const { testDevices } = require('./setup');

describe('Bulb', function () {
  before(function () {
    this.timeout(4000);
    this.slow(2000);
  });

  testDevices['bulb'].forEach((testBulb) => {
    let bulb;
    let model;
    context(testBulb.name, function () {
      beforeEach(async function () {
        if (!testBulb.getDevice) {
          this.skip();
        }
        bulb = await testBulb.getDevice();
        model = testBulb.model;
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
        it('should return is_variable_color_temp from cached sysInfo', function () {
          let range = bulb.getColorTemperatureRange;
          if (!bulb.supportsColorTemperature) {
            expect(range).to.be.undefined;
          } else {
            expect(range).to.to.have.property('min').a('number').within(2500, 9000);
            expect(range).to.to.have.property('max').a('number').within(2500, 9000);

            expect(model).to.match(/lb1[23]0/);
            if (model === 'lb120') {
              expect(range.min).to.eql(2700);
              expect(range.max).to.eql(6500);
            } else if (model === 'lb130') {
              expect(range.min).to.eql(2500);
              expect(range.max).to.eql(9000);
            }
          }
        });
      });

      describe('#getInfo()', function () {
        it('should return info', async function () {
          let results = await bulb.getInfo();
          expect(results).to.have.property('sysInfo');
          expect(results).to.have.property('cloudInfo');
          expect(results).to.have.property('emeterRealtime');
          expect(results).to.have.property('scheduleNextAction');
          expect(results).to.have.property('lightState');
        });
      });

      describe('#setLightState()', async function () {
        it('should turn on', async function () {
          expect(await bulb.setLightState({on_off: 1})).to.be.true;
          expect(await bulb.getLightState()).to.have.property('on_off', 1);
        });

        it('should turn off', async function () {
          expect(await bulb.setLightState({on_off: 0})).to.be.true;
          expect(await bulb.getLightState()).to.have.property('on_off', 0);
        });

        it('should change brightness if suported', async function () {
          if (!bulb.supportsBrightness) return;

          expect(await bulb.setLightState({on_off: 1, brightness: 20})).to.be.true;
          let ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
          expect(ls).to.have.property('brightness', 20);

          expect(await bulb.setLightState({on_off: 1, brightness: 60})).to.be.true;
          ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
          expect(ls).to.have.property('brightness', 60);
        });

        it('should change color temperature if suported', async function () {
          if (!bulb.supportsColorTemperature) return;

          expect(await bulb.setLightState({on_off: 1, color_temp: 4000})).to.be.true;
          let ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
          expect(ls).to.have.property('color_temp', 4000);

          expect(await bulb.setLightState({on_off: 1, color_temp: 5000})).to.be.true;
          ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
          expect(ls).to.have.property('color_temp', 5000);
        });

        it('should change color if suported', async function () {
          if (!bulb.supportsColor) return;

          expect(await bulb.setLightState({on_off: 1, hue: 100, saturation: 40, brightness: 20})).to.be.true;
          let ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
          expect(ls).to.have.property('hue', 100);
          expect(ls).to.have.property('saturation', 40);
          expect(ls).to.have.property('brightness', 20);

          expect(await bulb.setLightState({on_off: 1, hue: 200, saturation: 50, brightness: 60})).to.be.true;
          ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
          expect(ls).to.have.property('hue', 200);
          expect(ls).to.have.property('saturation', 50);
          expect(ls).to.have.property('brightness', 60);
        });

        it('should emit lightstate-on / lightstate-off / lightstate-change / lightstate-update', async function () {
          let spyOn = sinon.spy();
          let spyOff = sinon.spy();
          let spyChange = sinon.spy();
          let spyUpdate = sinon.spy();

          await bulb.setLightState({on_off: 0});

          bulb.on('lightstate-on', spyOn);
          bulb.on('lightstate-off', spyOff);
          bulb.on('lightstate-change', spyChange);
          bulb.on('lightstate-update', spyUpdate);

          await bulb.setLightState({on_off: 0});
          await bulb.setLightState({on_off: 1});
          await bulb.setLightState({on_off: 1});
          await bulb.setLightState({on_off: 0});
          await bulb.setLightState({on_off: 0});
          await bulb.setLightState({on_off: 1});

          expect(spyOn).to.be.calledTwice;
          expect(spyOn).to.be.always.calledWithMatch(sinon.match.has('on_off'));

          expect(spyOff).to.be.calledOnce;
          expect(spyOff).to.be.always.calledWithMatch(sinon.match.has('on_off'));

          expect(spyChange).to.be.calledThrice;
          expect(spyChange).to.be.always.calledWithMatch(sinon.match.has('on_off'));

          expect(spyUpdate).to.have.callCount(6);
          expect(spyUpdate).to.be.always.calledWithMatch(sinon.match.has('on_off'));
        });
      });

      describe('#getLightState()', function () {
        this.timeout(2000);
        this.slow(1000);
        it('should return light state when on', async function () {
          await bulb.setLightState({on_off: 1});
          let ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 1);
        });

        it('should return light state when off', async function () {
          await bulb.setLightState({on_off: 0});
          let ls = await bulb.getLightState();
          expect(ls).to.have.property('on_off', 0);
        });

        it('should emit lightstate-on / lightstate-off / lightstate-change / lightstate-update', async function () {
          let spyOn = sinon.spy();
          let spyOff = sinon.spy();
          let spyChange = sinon.spy();
          let spyUpdate = sinon.spy();

          await bulb.setLightState({on_off: 0});

          bulb.on('lightstate-on', spyOn);
          bulb.on('lightstate-off', spyOff);
          bulb.on('lightstate-change', spyChange);
          bulb.on('lightstate-update', spyUpdate);

          await bulb.getLightState();
          await bulb.getLightState();
          bulb.lastState.lightState.on_off = 1;
          bulb.lastState.powerOn = true;
          await bulb.getLightState();
          await bulb.getLightState();

          expect(spyOn, 'spyOn').to.not.be.called;

          expect(spyOff, 'spyOff').to.be.calledOnce;
          expect(spyOff, 'spyOff').to.be.always.calledWithMatch(sinon.match.has('on_off'));

          expect(spyChange).to.be.calledOnce;
          expect(spyChange).to.be.always.calledWithMatch(sinon.match.has('on_off'));

          expect(spyUpdate).to.have.callCount(4);
          expect(spyUpdate).to.be.always.calledWithMatch(sinon.match.has('on_off'));
        });
      });

      describe('#setPowerState()', function () {
        it('should turn on', function () {
          return expect(bulb.setPowerState(true)).to.eventually.be.true;
        });

        it('should turn off', function () {
          return expect(bulb.setPowerState(false)).to.eventually.be.true;
        });
      });

      describe('#getPowerState()', function () {
        this.timeout(2000);
        this.slow(1000);
        it('should return power state when on', async function () {
          await bulb.setPowerState(true);
          expect(await bulb.getPowerState()).to.be.true;
        });

        it('should return power state when off', async function () {
          await bulb.setPowerState(false);
          expect(await bulb.getPowerState()).to.be.false;
        });
      });
    });
  });
});
