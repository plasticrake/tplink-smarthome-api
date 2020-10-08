const { expect } = require('../setup');

module.exports = function (ctx) {
  describe('Time', function () {
    let device;

    beforeEach('Time', async function () {
      device = ctx.device;
    });

    describe('#getTime()', function () {
      it('should return time', function () {
        return expect(device.time.getTime()).to.eventually.have.property(
          'err_code',
          0
        );
      });
    });

    describe('#getTimezone()', function () {
      it('should return get time zone', function () {
        return expect(device.time.getTimezone()).to.eventually.have.property(
          'err_code',
          0
        );
      });
    });
  });
};
