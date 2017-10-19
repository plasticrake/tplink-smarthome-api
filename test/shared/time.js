/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect } = require('../setup');

module.exports = function (testDevice) {
  describe('Time', function () {
    this.timeout(5000);
    this.slow(2000);

    describe('#getTime()', function () {
      it('should return time', function () {
        return expect(this.device.time.getTime()).to.eventually.have.property('err_code', 0);
      });
    });

    describe('#getTimezone()', function () {
      it('should return get time zone', function () {
        return expect(this.device.time.getTimezone()).to.eventually.have.property('err_code', 0);
      });
    });
  });
};
