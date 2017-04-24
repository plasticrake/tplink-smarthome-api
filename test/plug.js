/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Plug', function () {
  var client;
  var plug;

  before(function () {
    client = new Hs100Api.Client();
    plug = client.getPlug(config.plug);
  });

  describe('#setPowerState', function () {
    it('should emit power-on', function (done) {
      plug.once('power-on', (plug) => {
        plug.should.exist;
        done();
      });

      plug.setPowerState(false).then(() => {
        plug.setPowerState(true);
      }).catch((reason) => {
        done(reason);
      });
    });

    it('should turn on', function () {
      return plug.setPowerState(true).should.eventually.be.true;
    });
  });

  describe('#getPowerState', function () {
    it('should return power state when on', function () {
      return plug.getPowerState().should.eventually.be.true;
    });
  });

  describe('#getConsumption', function () {
    it('should return consumption', function () {
      plug.getModel().then((value) => {
        if (/HS110/.test(value)) {
          return plug.getConsumption().should.eventually.have.property('err_code', 0);
        } else {
          return plug.getConsumption().should.eventually.have.property('err_code', -1);
        }
      }).catch((reason) => {
        return reason;
      });

    // return  plug.getConsumption().should.be.fulfilled
    });
  });

  describe('#setPowerState', function () {
    it('should emit power-off', function (done) {
      plug.once('power-off', (plug) => {
        plug.should.exist;
        done();
      });

      plug.setPowerState(true).then(() => {
        plug.setPowerState(false);
      }).catch((reason) => {
        done(reason);
      });
    });

    it('should turn off', function () {
      return plug.setPowerState(false).should.eventually.be.true;
    });
  });

  describe('#getPowerState', function () {
    it('should return power state when off', function () {
      return plug.getPowerState().should.eventually.be.false;
    });
  });

  describe('#getInfo', function () {
    it('should return info', function () {
      return plug.getInfo().should.eventually.have.property('sysInfo');
    });
  });

  describe('#getSysInfo', function () {
    it('should return info', function () {
      return plug.getSysInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getModel', function () {
    it('should return model', function () {
      return plug.getModel().should.eventually.match(/^HS1[01]0/);
    });
  });

  describe('#getCloudInfo', function () {
    it('should return cloud info', function () {
      return plug.getCloudInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScheduleNextAction', function () {
    it('should return schedule next action', function () {
      return plug.getScheduleNextAction().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScheduleRules', function () {
    it('should return schedule rules', function () {
      return plug.getScheduleRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getAwayRules', function () {
    it('should return away rules', function () {
      return plug.getAwayRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTimerRules', function () {
    it('should return timer rules', function () {
      return plug.getTimerRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTime', function () {
    it('should return time', function () {
      return plug.getTime().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTimeZone', function () {
    it('should return get time zone', function () {
      return plug.getTimeZone().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScanInfo', function () {
    it('should return get scan info', function () {
      this.timeout(10000);
      this.slow(5000);
      return plug.getScanInfo(true, 3).should.eventually.have.property('err_code', 0);
    });

    it('should return get cached scan info', function () {
      return plug.getScanInfo(false).should.eventually.have.property('err_code', 0);
    });
  });
});
