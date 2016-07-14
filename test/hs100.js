/* global describe, it, before */

'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.should();
chai.use(chaiAsPromised);

var Hs100Api = require('..');

describe('Hs100Api', function () {
  var hs;

  before(function () {
    hs = new Hs100Api({host: '10.0.1.58'});
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
