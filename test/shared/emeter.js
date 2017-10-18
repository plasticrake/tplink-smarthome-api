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
    describe('#realtime get', function () {
      it('should return realtime after getRealtime called', async function () {
        await this.device.getSysInfo();
        if (this.device.supportsEmeter) {
          let er = await this.device.emeter.getRealtime();
          expect(this.device.emeter.realtime).to.eql(er);
        } else {
          expect(this.device.emeter.realtime).to.eql({});
        }
      });
    });
    describe('#getRealtime()', function () {
      it('should return Realtime if supported or throw error', async function () {
        await this.device.getSysInfo();
        if (this.device.supportsEmeter) {
          return expect(this.device.emeter.getRealtime()).to.eventually.have.property('err_code', 0);
        } else {
          return expect(this.device.emeter.getRealtime()).to.eventually.be.rejectedWith(ResponseError);
        }
      });
      it('should emit emeter-realtime-update if supported', async function () {
        await this.device.getSysInfo();
        if (!this.device.supportsEmeter) return;

        let spy = sinon.spy();

        this.device.on('emeter-realtime-update', spy);
        await this.device.emeter.getRealtime();
        await this.device.emeter.getRealtime();

        expect(spy).to.be.calledTwice;
        expect(spy).to.be.calledWithMatch({err_code: 0});
      });
    });
  });
};
