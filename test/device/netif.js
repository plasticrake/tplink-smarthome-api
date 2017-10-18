/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

module.exports = function () {
  describe('Netif', function () {
    describe('#getScanInfo()', function () {
      it('should return scan info', function () {
        this.timeout(10000);
        this.slow(6000);
        return expect(this.device.netif.getScanInfo(true, 2)).to.eventually.have.property('err_code', 0);
      });
      it('should return cached scan info', function () {
        this.slow(1000);
        return expect(this.device.netif.getScanInfo(false)).to.eventually.have.property('err_code', 0);
      });
    });
  });
};
