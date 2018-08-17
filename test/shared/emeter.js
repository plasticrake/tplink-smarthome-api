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
      it('should return Realtime normalized with old and new API', async function () {
        if (supportsEmeter) {
          let response = await this.device.emeter.getRealtime();
          expect(response).to.have.property('err_code', 0);
          if (response.current != null || response.current_ma != null) {
            expect(response).to.have.property('current');
            expect(response).to.have.property('current_ma');
            expect(response.current, 'current').to.be.closeTo(response.current_ma / 1000, 1);
          }
          if (response.power != null || response.power_mw != null) {
            expect(response).to.have.property('power');
            expect(response).to.have.property('power_mw');
            expect(response.power, 'power').to.be.closeTo(response.power_mw / 1000, 1);
          }
          if (response.total != null || response.total_wh != null) {
            expect(response).to.have.property('total');
            expect(response).to.have.property('total_wh');
            expect(response.total, 'total').to.be.closeTo(response.total_wh / 1000, 1);
          }
          if (response.voltage != null || response.voltage_mv != null) {
            expect(response).to.have.property('voltage');
            expect(response).to.have.property('voltage_mv');
            expect(response.voltage, 'voltage').to.be.closeTo(response.voltage_mv / 1000, 1);
          }
        } else {
          return expect(this.device.emeter.getRealtime()).to.eventually.be.rejectedWith(ResponseError);
        }
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
