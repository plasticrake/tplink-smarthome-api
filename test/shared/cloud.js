/* eslint-env mocha */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const dotenv = require('dotenv');
dotenv.config();

const username = process.env.TEST_CLOUD_USERNAME || 'username';
const password = process.env.TEST_CLOUD_PASSWORD || 'password';
const serverUrl = process.env.TEST_CLOUD_SERVER_URL || 'tplink.com';

async function bindCloud (device, force = false) {
  let ci = await device.cloud.getInfo();
  if (ci.binded === 1 && force) {
    expect(await device.cloud.unbind()).to.have.property('err_code', 0);
    ci.binded = 0;
  }
  if (ci.binded === 0) {
    expect(await device.cloud.bind({ username, password })).to.have.property('err_code', 0);
  }
}

async function unbindCloud (device, force = false) {
  let ci = await device.cloud.getInfo();
  if (ci.binded === 0 && force) {
    expect(await device.cloud.bind({ username, password })).to.have.property('err_code', 0);
    ci.binded = 1;
  }
  if (ci.binded === 1) {
    expect(await device.cloud.unbind()).to.have.property('err_code', 0);
  }
}

module.exports = function () {
  describe('Cloud', function () {
    let originalCloudInfo;

    before(async function getOriginalCloudInfo () {
      if (!this.device) this.skip();
      originalCloudInfo = await this.device.cloud.getInfo();
    });

    after(async function resetCloudToOriginal () {
      if (!this.device) this.skip();
      const currentCloudInfo = await this.device.cloud.getInfo();
      if (originalCloudInfo.server !== currentCloudInfo.server) {
        await this.device.cloud.setServerUrl(originalCloudInfo.server);
      }
      if (originalCloudInfo.binded !== currentCloudInfo.binded) {
        if (originalCloudInfo.binded === 1) {
          await this.device.cloud.bind({ username, password });
        } else {
          await this.device.cloud.unbind();
        }
      }
    });

    describe('#getInfo()', function () {
      // Does not require to be logged in to cloud
      it('should return cloud info', async function () {
        let ci = await this.device.cloud.getInfo();
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
        this.timeout(4000);
        expect(await this.device.cloud.getFirmwareList()).to.have.property('err_code', 0);
      });
    });
    describe('#setServerUrl()', function () {
      // Does not require to be logged in to cloud
      it('should change cloud server url', async function () {
        expect(await this.device.cloud.setServerUrl(serverUrl)).to.have.property('err_code', 0);
        expect(await this.device.cloud.getInfo()).to.have.property('server', serverUrl);
      });
    });
  });
};
