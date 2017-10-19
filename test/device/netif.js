/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect } = require('../setup');

module.exports = function () {
  describe('Netif', function () {
    this.timeout(5000);
    this.slow(2000);

    describe('#getScanInfo()', function () {
      it('should return scan info', function () {
        this.timeout(10000);
        this.slow(6000);
        return expect(this.device.netif.getScanInfo(true, 2)).to.eventually.have.property('err_code', 0);
      });
      it('should return cached scan info', function () {
        return expect(this.device.netif.getScanInfo(false)).to.eventually.have.property('err_code', 0);
      });
    });
  });
};
