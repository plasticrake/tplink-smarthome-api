const { config, expect } = require('../setup');

module.exports = function () {
  describe('Netif', function () {
    describe('#getScanInfo() @slow', function () {
      it('should return scan info', function () {
        this.timeout(config.defaultTestTimeout * 4);
        this.slow(config.defaultTestTimeout * 2);
        return expect(
          this.device.netif.getScanInfo(true, 2)
        ).to.eventually.have.property('err_code', 0);
      });
      it('should return cached scan info', function () {
        return expect(
          this.device.netif.getScanInfo(false)
        ).to.eventually.have.property('err_code', 0);
      });
    });
  });
};
