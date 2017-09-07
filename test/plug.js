/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));

const config = require('./lib/config');
const Hs100Api = require('..');

describe('Plug', function () {
  let client;
  let plug;

  beforeEach(function () {
    client = new Hs100Api.Client();
    plug = client.getPlug(config.plug);
  });

  describe('#setPowerState()', function () {
    it('should turn on', function () {
      return plug.setPowerState(true).should.eventually.be.true;
    });

    it('should turn off', function () {
      return plug.setPowerState(false).should.eventually.be.true;
    });

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
  });

  describe('#getPowerState()', function () {
    it('should return power state when on', function () {
      return plug.setPowerState(true).then(() => {
        plug.getPowerState().should.eventually.be.true;
      });
    });

    it('should return power state when off', function () {
      return plug.setPowerState(false).then(() => {
        plug.getPowerState().should.eventually.be.false;
      });
    });
  });

  describe('#setLedState()', function () {
    this.slow(1000);
    it('should turn LED off', function () {
      return plug.setLedState(false).should.eventually.be.true;
    });

    it('should turn LED on', function () {
      return plug.setLedState(true).should.eventually.be.true;
    });
  });

  describe('#getLedState()', function () {
    this.slow(1000);

    it('should return LED state when off', function () {
      return plug.setLedState(false).then(() => {
        plug.getLedState().should.eventually.be.false;
      });
    });

    it('should return LED state when on', function () {
      return plug.setLedState(true).then(() => {
        plug.getLedState().should.eventually.be.true;
      });
    });
  });

  describe('#blink()', function () {
    this.slow(2000);
    this.timeout(4000);
    it('should blink LED', function () {
      return plug.blink(3, 100).should.eventually.be.true;
    });
  });

  describe('#getConsumption()', function () {
    it('should return consumption', function () {
      return plug.getSysInfo((si) => {
        if (plug.supportsConsumption) {
          plug.getConsumption().should.eventually.have.property('err_code', 0);
        } else {
          plug.getConsumption().should.eventually.have.property('err_code', -1);
        }
      });
    });
  });

  describe('#getInfo()', function () {
    it('should return info', function () {
      return plug.getInfo().should.eventually.have.property('sysInfo');
    });
  });

  describe('#getSysInfo()', function () {
    it('should return info', function () {
      return plug.getSysInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getModel()', function () {
    it('should return model', function () {
      return plug.getModel().should.eventually.match(/^HS1[01]0/);
    });
  });

  describe('#getCloudInfo()', function () {
    it('should return cloud info', function () {
      return plug.getCloudInfo().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScheduleNextAction()', function () {
    it('should return schedule next action', function () {
      return plug.getScheduleNextAction().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScheduleRules()', function () {
    it('should return schedule rules', function () {
      return plug.getScheduleRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getAwayRules()', function () {
    it('should return away rules', function () {
      return plug.getAwayRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTimerRules()', function () {
    it('should return timer rules', function () {
      return plug.getTimerRules().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTime()', function () {
    it('should return time', function () {
      return plug.getTime().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getTimeZone()', function () {
    it('should return get time zone', function () {
      return plug.getTimeZone().should.eventually.have.property('err_code', 0);
    });
  });

  describe('#getScanInfo()', function () {
    it('should return get scan info', function () {
      this.timeout(8000);
      this.slow(6000);
      plug.timeout = 3000;
      return plug.getScanInfo(true, 3).should.eventually.have.property('err_code', 0);
    });

    it('should return get cached scan info', function () {
      this.slow(1000);
      return plug.getScanInfo(false).should.eventually.have.property('err_code', 0);
    });
  });
});
