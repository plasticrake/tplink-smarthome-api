/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('../setup');

const { ResponseError } = require('../../src');

module.exports = function (ctx, testDevice) {
  describe('Emeter', function () {
    let device;
    let month;
    let year;
    let supportsEmeter;

    beforeEach('Emeter', async function () {
      device = ctx.device;
      supportsEmeter = ctx.supportsEmeter;
    });

    before('Emeter', async function () {
      if (!testDevice.getDevice) this.skip();

      const today = new Date();
      month = today.getMonth() + 1;
      year = today.getFullYear();
    });

    describe('#realtime get', function () {
      it('should return realtime after getRealtime called', async function () {
        if (!supportsEmeter) this.skip();
        const er = await device.emeter.getRealtime();
        expect(device.emeter.realtime).to.eql(er);
      });
    });
    describe('#getRealtime()', function () {
      it('should return Realtime if supported or throw error', async function () {
        if (supportsEmeter) {
          return expect(
            device.emeter.getRealtime(),
          ).to.eventually.have.property('err_code', 0);
        }
        return expect(
          device.emeter.getRealtime(),
        ).to.eventually.be.rejectedWith(ResponseError);
      });
      it('should emit emeter-realtime-update if supported', async function () {
        if (!supportsEmeter) return;

        const spy = sinon.spy();

        device.on('emeter-realtime-update', spy);
        await device.emeter.getRealtime();
        await device.emeter.getRealtime();

        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWithMatch({ err_code: 0 });
      });
      it('should return Realtime normalized with old and new API', async function () {
        if (supportsEmeter) {
          const response = await device.emeter.getRealtime();
          expect(response).to.have.property('err_code', 0);
          if (response.current != null || response.current_ma != null) {
            expect(response).to.have.property('current');
            expect(response).to.have.property('current_ma');
            expect(response.current, 'current').to.be.closeTo(
              response.current_ma / 1000,
              1,
            );
          }
          if (response.power != null || response.power_mw != null) {
            expect(response).to.have.property('power');
            expect(response).to.have.property('power_mw');
            expect(response.power, 'power').to.be.closeTo(
              response.power_mw / 1000,
              1,
            );
          }
          if (response.total != null || response.total_wh != null) {
            expect(response).to.have.property('total');
            expect(response).to.have.property('total_wh');
            expect(response.total, 'total').to.be.closeTo(
              response.total_wh / 1000,
              1,
            );
          }
          if (response.voltage != null || response.voltage_mv != null) {
            expect(response).to.have.property('voltage');
            expect(response).to.have.property('voltage_mv');
            expect(response.voltage, 'voltage').to.be.closeTo(
              response.voltage_mv / 1000,
              1,
            );
          }
        } else {
          return expect(
            device.emeter.getRealtime(),
          ).to.eventually.be.rejectedWith(ResponseError);
        }
        return null;
      });
    });

    describe('#getDayStats()', function () {
      it('should return day stats', function () {
        if (supportsEmeter) {
          return expect(
            device.emeter.getDayStats(year, month),
          ).to.eventually.have.property('err_code', 0);
        }
        return expect(
          device.emeter.getDayStats(year, month),
        ).to.eventually.be.rejectedWith(ResponseError);
      });
    });

    describe('#getMonthStats()', function () {
      it('should return day stats', function () {
        if (supportsEmeter) {
          return expect(
            device.emeter.getMonthStats(year),
          ).to.eventually.have.property('err_code', 0);
        }
        return expect(
          device.emeter.getMonthStats(year),
        ).to.eventually.be.rejectedWith(ResponseError);
      });
    });

    describe('#eraseStats()', function () {
      it('(simulated only) should erase stats', function () {
        if (testDevice.type !== 'simulated') this.skip();
        if (supportsEmeter) {
          return expect(device.emeter.eraseStats()).to.eventually.have.property(
            'err_code',
            0,
          );
        }
        return expect(device.emeter.eraseStats()).to.eventually.be.rejectedWith(
          ResponseError,
        );
      });
    });
  });
};
