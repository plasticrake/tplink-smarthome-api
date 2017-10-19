/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect } = require('../setup');

const { ResponseError } = require('../../src');

module.exports = function () {
  describe('Timer', function () {
    this.timeout(5000);
    this.slow(2000);

    describe('#getRules()', function () {
      it('should return timer rules', function () {
        return expect(this.device.timer.getRules()).to.eventually.have.property('err_code', 0);
      });
    });

    describe('#addRule()', function () {
      it('should add timer rule', async function () {
        let response = await this.device.timer.addRule({delay: 20, powerState: false});
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id').that.is.a('string');

        let id = response.id;
        let rules = await this.device.timer.getRules();
        expect(rules.rule_list[0].id).to.eql(id);
      });

      it('should delete existing rules and add timer rule when deleteExisting is true', async function () {
        await this.device.timer.addRule({delay: 20, powerState: false, deleteExisting: true});

        let response = await this.device.timer.addRule({delay: 50, powerState: false, deleteExisting: true});
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id').that.is.a('string');
      });

      it('should fail if a timer rule exists when deleteExisting is false', async function () {
        await this.device.timer.addRule({delay: 20, powerState: false, deleteExisting: true});
        return expect(this.device.timer.addRule({delay: 20, powerState: false, deleteExisting: false})).to.eventually.be.rejectedWith(ResponseError);
      });
    });

    describe('#editRule()', function () {
      it('should edit timer rule', async function () {
        let response = await this.device.timer.addRule({delay: 20, powerState: false});
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id').that.is.a('string');

        let id = response.id;

        await this.device.timer.editRule({id, delay: 50, powerStart: false});

        let rules = await this.device.timer.getRules();
        expect(rules.rule_list[0].id).to.eql(id);
        expect(rules.rule_list[0].delay).to.eql(50);
      });
    });

    describe('#deleteAllRules()', function () {
      it('should delete timer rules', function () {
        return expect(this.device.timer.deleteAllRules()).to.eventually.have.property('err_code', 0);
      });
    });
  });
};
