/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
chai.use(chaiAsPromised);

module.exports = function () {
  describe('Schedule', function () {
    describe('#addRule()', function () {
      it('should add non repeating rule', async function () {
        let response = await this.device.schedule.addRule({ powerState: true, start: 60 });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add repeating rule', async function () {
        let response = await this.device.schedule.addRule({ powerState: false, start: 120, daysOfWeek: [0, 6] });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add disabled rule', async function () {
        let response = await this.device.schedule.addRule({ powerState: false, start: 120, name: 'disabled', enable: false });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
    });

    describe('#editRule()', function () {
      it('should edit a rule', async function () {
        let addResponse = await this.device.schedule.addRule({ powerState: true, start: 60 });
        expect(addResponse).to.have.property('err_code', 0);
        expect(addResponse).to.have.property('id');

        let editResponse = await this.device.schedule.editRule({ id: addResponse.id, powerState: false, start: 120 });
        expect(editResponse).to.have.property('err_code', 0);

        let getResponse = await this.device.schedule.getRule(addResponse.id);
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse).to.have.property('id', addResponse.id);
        expect(getResponse).to.have.property('sact', 0);
        expect(getResponse).to.have.property('smin', 120);
      });
    });
  });
};
