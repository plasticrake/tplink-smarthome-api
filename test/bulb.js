/* eslint-env mocha */
/* global testDevices */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));

describe('Bulb', function () {
  before(function () {
    this.timeout(4000);
    this.slow(2000);
  });

  testDevices['bulb'].forEach((testBulb) => {
    let bulb;
    context(testBulb.name, function () {
      beforeEach(function () {
        if (!testBulb.device) {
          this.skip();
        }
        bulb = testBulb.device;
      });
      describe('#setLightState()', function () {
        it('should turn on', function () {
          return expect(bulb.setLightState({on_off: 1})).to.eventually.be.true;
        });

        it('should turn off', function () {
          return expect(bulb.setLightState({on_off: 0})).to.eventually.be.true;
        });
        it('should emit power-on', function (done) {
          bulb.once('power-on', (bulb) => {
            expect(bulb).to.exist;
            done();
          });
          (async () => {
            try {
              await bulb.setLightState({on_off: 0});
              await bulb.setLightState({on_off: 1});
            } catch (err) { done(err); }
          })();
        });

        it('should emit power-off', function (done) {
          bulb.once('power-off', (bulb) => {
            expect(bulb).to.exist;
            done();
          });
          (async () => {
            try {
              await bulb.setLightState({on_off: 1});
              await bulb.setLightState({on_off: 2});
            } catch (err) { done(err); }
          })();
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
      });

      describe('#setPowerState()', function () {
        it('should turn on', function () {
          return expect(bulb.setPowerState(true)).to.eventually.be.true;
        });

        it('should turn off', function () {
          return expect(bulb.setPowerState(false)).to.eventually.be.true;
        });

        it('should emit power-on', function (done) {
          bulb.once('power-on', (bulb) => {
            expect(bulb).to.exist;
            done();
          });
          (async () => {
            try {
              await bulb.setPowerState(false);
              await bulb.setPowerState(true);
            } catch (err) { done(err); }
          })();
        });

        it('should emit power-off', function (done) {
          bulb.once('power-off', (bulb) => {
            expect(bulb).to.exist;
            done();
          });
          (async () => {
            try {
              await bulb.setPowerState(true);
              await bulb.setPowerState(false);
            } catch (err) { done(err); }
          })();
        });
      });

      describe('#getPowerState()', function () {
        this.timeout(2000);
        this.slow(1000);
        it('should return power state when on', async function () {
          await bulb.setPowerState(true);
          return expect(bulb.getPowerState()).to.eventually.be.true;
        });

        it('should return power state when off', async function () {
          await bulb.setPowerState(false);
          return expect(bulb.getPowerState()).to.eventually.be.false;
        });
      });
    });
  });
});
