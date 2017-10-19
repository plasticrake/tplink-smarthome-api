/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, sinon } = require('../setup');

const { ResponseError } = require('../../src');

module.exports = function (testDevice) {
  describe('Emeter', function () {
    this.timeout(5000);
    this.slow(2000);

    let month;
    let year;
    let supportsEmeter;

    before(async function () {
      if (!testDevice.getDevice) return this.skip();
      let today = new Date();
      month = today.getMonth() + 1;
      year = today.getFullYear();

      let device = await testDevice.getDevice();
      await device.getSysInfo();
      supportsEmeter = device.supportsEmeter;
    });

    describe('#realtime get', function () {
      it('should return realtime after getRealtime called', async function () {
        if (supportsEmeter) {
          let er = await this.device.emeter.getRealtime();
          expect(this.device.emeter.realtime).to.eql(er);
        } else {
          expect(this.device.emeter.realtime).to.eql({});
        }
      });
    });
    describe('#getRealtime()', function () {
      it('should return Realtime if supported or throw error', async function () {
        if (supportsEmeter) {
          return expect(this.device.emeter.getRealtime()).to.eventually.have.property('err_code', 0);
        } else {
          return expect(this.device.emeter.getRealtime()).to.eventually.be.rejectedWith(ResponseError);
        }
      });
      it('should emit emeter-realtime-update if supported', async function () {
        if (!supportsEmeter) return;

        let spy = sinon.spy();

        this.device.on('emeter-realtime-update', spy);
        await this.device.emeter.getRealtime();
        await this.device.emeter.getRealtime();

        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWithMatch({err_code: 0});
      });
    });

    describe('#getDayStats()', function () {
      it('should return day stats', function () {
        if (supportsEmeter) {
          return expect(this.device.emeter.getDayStats(year, month)).to.eventually.have.property('err_code', 0);
        } else {
          return expect(this.device.emeter.getDayStats(year, month)).to.eventually.be.rejectedWith(ResponseError);
        }
      });
    });

    describe('#getMonthStats()', function () {
      it('should return day stats', function () {
        if (supportsEmeter) {
          return expect(this.device.emeter.getMonthStats(year)).to.eventually.have.property('err_code', 0);
        } else {
          return expect(this.device.emeter.getMonthStats(year)).to.eventually.be.rejectedWith(ResponseError);
        }
      });
    });

    describe('#eraseStats()', function () {
      it('(simulated only) should erase stats', function () {
        if (testDevice.type !== 'simulated') this.skip();
        if (supportsEmeter) {
          return expect(this.device.emeter.eraseStats()).to.eventually.have.property('err_code', 0);
        } else {
          return expect(this.device.emeter.eraseStats()).to.eventually.be.rejectedWith(ResponseError);
        }
      });
    });
  });
};
