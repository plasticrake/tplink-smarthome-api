/* global describe, it, before */

'use strict';

const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Hs100Api', function () {
  var hs;

  before(function () {
    hs = new Hs100Api(config);
  });

  describe('#search', function () {
    it('should search and find plugs', function () {
      this.timeout(3500);
      this.slow(3500);
      return hs.search().should.eventually.include.something.with.property('err_code', 0);
    });
  });

  describe('#setPowerState', function () {
    it('should turn on', function () {
      return hs.setPowerState(true).should.eventually.be.true;
    });
  });
  describe('#getPowerState', function () {
    it('should return power state when on', function () {
      return hs.getPowerState().should.eventually.equal(true);
    });
  });

  describe('#getConsumption', function () {
    it('should return consumption', function () {
      hs.getModel().then((value) => {
        if (/HS110/.test(value)) {
          return hs.getConsumption().should.eventually.have.property('err_code', 0);
        } else {
          return hs.getConsumption().should.eventually.have.property('err_code', -1);
        }
      });

    // return hs.getConsumption().should.be.fulfilled
    });
  });

  describe('#setPowerState', function () {
    it('should turn off', function () {
      return hs.setPowerState(false).should.eventually.be.true;
    });
  });

  describe('#getPowerState', function () {
    it('should return power state when off', function () {
      return hs.getPowerState().should.eventually.equal(false);
    });
  });

  describe('#getInfo', function () {
    it('should return info', function () {
      return hs.getInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getModel', function () {
    it('should return model', function () {
      return hs.getModel().should.eventually.match(/^HS1[01]0/);
    });
  });

  describe('#getCloudInfo', function () {
    it('should return cloud info', function () {
      return hs.getCloudInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScheduleNextAction', function () {
    it('should return schedule next action', function () {
      return hs.getScheduleNextAction().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScheduleRules', function () {
    it('should return schedule rules', function () {
      return hs.getScheduleRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getAwayRules', function () {
    it('should return away rules', function () {
      return hs.getAwayRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTimerRules', function () {
    it('should return timer rules', function () {
      return hs.getTimerRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTime', function () {
    it('should return time', function () {
      return hs.getTime().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTimeZone', function () {
    it('should return get time zone', function () {
      return hs.getTimeZone().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScanInfo', function () {
    it('should return get scan info', function () {
      return hs.getScanInfo().should.eventually.have.property('err_code', 0);
    });
  });
});
