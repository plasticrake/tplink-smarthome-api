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

const { ResponseError } = require('../../src');

module.exports = function () {
  describe('Emeter', function () {
    let month;
    let year;
    let supportsEmeter;

    before(async function () {
      let today = new Date();
      month = today.getMonth() + 1;
      year = today.getFullYear();

      await this.device.getSysInfo();
      supportsEmeter = this.device.supportsEmeter;
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
        if (this.testDevice.type !== 'simulated') this.skip();
        if (supportsEmeter) {
          return expect(this.device.emeter.eraseStats()).to.eventually.have.property('err_code', 0);
        } else {
          return expect(this.device.emeter.eraseStats()).to.eventually.be.rejectedWith(ResponseError);
        }
      });
    });
  });
};
