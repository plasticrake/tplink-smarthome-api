/* global describe, it, before */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Hs100Api', function () {
  var hs;

  before(function () {
    hs = new Hs100Api(config);
  });

  describe('#setPowerState', function () {
    it('should turn on', function () {
      return hs.setPowerState(true).should.be.fulfilled;
    });
  });
  describe('#getPowerState', function () {
    it('should return power state when on', function () {
      return hs.getPowerState().should.eventually.equal(true);
    });
  });

  describe('#setPowerState', function () {
    it('should turn off', function () {
      return hs.setPowerState(false).should.be.fulfilled;
    });
  });

  describe('#getPowerState', function () {
    it('should return power state when off', function () {
      return hs.getPowerState().should.eventually.equal(false);
    });
  });

  describe('#getConsumption', function () {
    it('should return consumption', function () {
      return hs.getConsumption().should.be.fulfilled;
    });
  });
});
