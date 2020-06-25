const { expect, config } = require('../setup');

// Certain longer running commands may return an err_code response of 0,
// but follow up commands may fail with `{ err_code: -32, err_msg: 'another cmd is running' }`
// eslint-disable-next-line consistent-return
async function retryIfBusy(fn) {
  let runCount = 0;
  do {
    runCount += 1;

    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (err) {
      const r = JSON.parse(err.response);
      if (!(r && r.err_code === -32)) {
        throw err;
      }
      // else retry loop
      // wait before retrying
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (runCount < 5);
}

async function bindCloud(device, force = false) {
  const ci = await device.cloud.getInfo();

  if (ci.binded === 1 && force) {
    expect(await retryIfBusy(() => device.cloud.unbind())).to.have.property(
      'err_code',
      0
    );
    ci.binded = 0;
  }

  if (ci.binded === 0) {
    expect(
      await retryIfBusy(() =>
        device.cloud.bind(config.cloudUsername, config.cloudPassword)
      )
    ).to.have.property('err_code', 0);
  }
}

async function unbindCloud(device, force = false) {
  const ci = await device.cloud.getInfo();
  if (ci.binded === 0 && force) {
    expect(
      await retryIfBusy(() =>
        device.cloud.bind(config.cloudUsername, config.cloudPassword)
      )
    ).to.have.property('err_code', 0);
    ci.binded = 1;
  }
  if (ci.binded === 1) {
    expect(await retryIfBusy(() => device.cloud.unbind())).to.have.property(
      'err_code',
      0
    );
  }
}

module.exports = function (testDevice) {
  describe.skip('Cloud @slow', function () {
    this.timeout(config.defaultTestTimeout * 2);
    this.slow(config.defaultTestTimeout);

    let originalCloudInfo;
    let skipped = false;

    beforeEach('Cloud', async function () {
      this.timeout(config.defaultTestTimeout * 2);
      this.slow(config.defaultTestTimeout);
    });

    before('Cloud', async function getOriginalCloudInfo() {
      if (!testDevice.getDevice) {
        skipped = true;
        this.skip();
        return;
      }
      // const device = await testDevice.getDevice();
      originalCloudInfo = await this.device.cloud.getInfo();
    });

    after('Cloud', async function resetCloudToOriginal() {
      if (skipped) return;
      this.timeout(config.defaultTestTimeout * 4);
      this.slow(config.defaultTestTimeout * 2);

      const currentCloudInfo = await retryIfBusy(() =>
        this.device.cloud.getInfo()
      );
      if (originalCloudInfo.server !== currentCloudInfo.server) {
        await retryIfBusy(() =>
          this.device.cloud.setServerUrl(originalCloudInfo.server)
        );
      }
      if (originalCloudInfo.binded !== currentCloudInfo.binded) {
        if (originalCloudInfo.binded === 1) {
          await retryIfBusy(() =>
            this.device.cloud.bind(config.cloudUsername, config.cloudPassword)
          );
        } else {
          await retryIfBusy(() => this.device.cloud.unbind());
        }
      }
    });

    describe('#getInfo()', function () {
      // Does not require to be logged in to cloud
      it('should return cloud info', async function () {
        const ci = await this.device.cloud.getInfo();
        expect(ci).to.have.property('err_code', 0);
        expect(ci).to.include.keys('username', 'server');
      });
    });
    describe('#bind()', function () {
      it('should add device to cloud', async function () {
        return bindCloud(this.device, true);
      });
    });
    describe('#unbind()', function () {
      it('should remove device from cloud', async function () {
        return unbindCloud(this.device, true);
      });
    });
    describe('#getFirmwareList()', function () {
      // Does not require to be logged in to cloud
      it('should get firmware list from cloud', async function () {
        expect(await this.device.cloud.getFirmwareList()).to.have.property(
          'err_code',
          0
        );
      });
    });
    describe('#setServerUrl()', function () {
      // Does not require to be logged in to cloud
      it('should change cloud server url', async function () {
        expect(
          await this.device.cloud.setServerUrl(config.cloudServerUrl)
        ).to.have.property('err_code', 0);
      });
    });
  });
};
