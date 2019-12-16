/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect } = require('../setup');

module.exports = function (testDevice) {
  describe('Schedule', function () {
    this.timeout(5000);
    this.slow(2000);

    before(async function () {
      if (!testDevice.getDevice) return this.skip();
      const device = await testDevice.getDevice();
      await device.schedule.deleteAllRules();
    });

    describe('#addRule()', function () {
      it('should add non repeating rule', async function () {
        const response = await this.device.schedule.addRule({ powerState: true, start: 60 });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add repeating rule', async function () {
        const response = await this.device.schedule.addRule({ powerState: false, start: 120, daysOfWeek: [0, 6] });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add disabled rule', async function () {
        const response = await this.device.schedule.addRule({ powerState: false, start: 120, name: 'disabled', enable: false });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add rule with dimmer (devices that support dimmer)', async function () {
        if (!this.device.supportsDimmer) this.skip();
        const inputRule = { dimmer: { on_off: 1, brightness: 54, transition_period: 1000 }, start: 120, name: 'dimmer' };
        const response = await this.device.schedule.addRule(inputRule);
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
        const rule = await this.device.schedule.getRule(response.id);
        expect(rule.sact).to.eql(3);
        expect(rule.s_dimmer).to.deep.eql(inputRule.dimmer);
      });
    });

    describe('#editRule()', function () {
      it('should edit a rule', async function () {
        this.timeout(7000);
        this.slow(4000);
        const addResponse = await this.device.schedule.addRule({ powerState: false, start: 60 });
        expect(addResponse).to.have.property('err_code', 0);
        expect(addResponse).to.have.property('id');

        const editResponse = await this.device.schedule.editRule({ id: addResponse.id, powerState: true, start: 120, enable: false });
        expect(editResponse).to.have.property('err_code', 0);

        const getResponse = await this.device.schedule.getRule(addResponse.id);
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse).to.have.property('id', addResponse.id);
        expect(getResponse).to.have.property('sact', 1);
        expect(getResponse).to.have.property('smin', 120);
        expect(getResponse).to.have.property('enable', 0);
      });

      it('should edit a rule with dimmer (devices that support dimmer)', async function () {
        if (!this.device.supportsDimmer) this.skip();
        this.timeout(7000);
        this.slow(4000);

        const addRule = { dimmer: { on_off: 1, brightness: 54, transition_period: 1000 }, start: 120, name: 'dimmer' };
        const addResponse = await this.device.schedule.addRule(addRule);
        expect(addResponse).to.have.property('err_code', 0);
        expect(addResponse).to.have.property('id');

        const editRule = { dimmer: { on_off: 1, brightness: 33, transition_period: 500 }, start: 110 };
        const editResponse = await this.device.schedule.editRule(Object.assign({ id: addResponse.id }, editRule));
        expect(editResponse).to.have.property('err_code', 0);

        const getResponse = await this.device.schedule.getRule(addResponse.id);
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse).to.have.property('id', addResponse.id);
        expect(getResponse).to.have.property('sact', 3);
        expect(getResponse).to.have.property('smin', 110);
        expect(getResponse.s_dimmer).to.deep.eql(editRule.dimmer);
      });
    });
  });
};
