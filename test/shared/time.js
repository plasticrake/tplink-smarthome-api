/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

module.exports = function () {
  describe('Time', function () {
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
