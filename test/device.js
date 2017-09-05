/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Device', function () {
  let client;
  let device;

  beforeEach(function () {
    client = new Hs100Api.Client();
    device = client.getGeneralDevice(config.plug);
  });

  describe('#getSysInfo()', function () {
    it('should return info', function () {
      return device.getSysInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getModel()', function () {
    it('should return model', function () {
      return device.getModel().should.eventually.match(/^HS1[01]0/);
    });
  });

  describe('#type', function () {
    it('should return type of "device" before querying device', function () {
      device.type.should.equal('device');
    });
    it('should return actual type after querying device', function () {
      return device.getSysInfo().then((si) => {
        device.type.should.equal('plug');
      });
    });
  });
});
