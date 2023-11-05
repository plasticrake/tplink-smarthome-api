/* eslint-disable no-unused-expressions */

const { config, expect } = require('../setup');

module.exports = function (ctx) {
  describe('Away', function () {
    let device;

    beforeEach('Away', async function () {
      device = ctx.device;
    });

    describe('#getRules()', function () {
      it('should return away rules', function () {
        return expect(device.away.getRules()).to.eventually.have.property(
          'err_code',
          0,
        );
      });
    });
    describe('#addRule()', function () {
      it('should add non repeating rule', async function () {
        const response = await device.away.addRule({
          start: 60,
          end: 120,
        });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add repeating rule', async function () {
        const response = await device.away.addRule({
          start: 120,
          end: 240,
          daysOfWeek: [0, 6],
        });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add disabled rule', async function () {
        const response = await device.away.addRule({
          start: 120,
          end: 600,
          name: 'disabled',
          enable: false,
        });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
    });

    describe('#editRule()', function () {
      it('should edit a rule', async function () {
        this.timeout(config.defaultTestTimeout * 3);
        this.slow(config.defaultTestTimeout * 2);

        const addResponse = await device.away.addRule({
          start: 60,
          end: 240,
        });
        expect(addResponse).to.have.property('err_code', 0);
        expect(addResponse).to.have.property('id');

        const editResponse = await device.away.editRule({
          id: addResponse.id,
          start: 120,
          end: 600,
        });
        expect(editResponse).to.have.property('err_code', 0);

        const getResponse = await device.away.getRule(addResponse.id);
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse).to.have.property('id', addResponse.id);
        expect(getResponse).to.have.property('smin', 120);
        expect(getResponse).to.have.property('emin', 600);
      });
    });
    describe('#deleteAllRules()', function () {
      it('should delete all rules', async function () {
        const addResponse = await device.away.addRule({
          start: 60,
          end: 240,
        });
        expect(addResponse, 'addRule').to.have.property('err_code', 0);
        expect(addResponse, 'addRule').to.have.property('id');

        const deleteResponse = await device.away.deleteAllRules();
        expect(deleteResponse).to.have.property('err_code', 0);

        const getResponse = await device.away.getRules();
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse.rule_list).to.have.property('length', 0);
      });
    });
    describe('#deleteRule()', function () {
      it('should delete a rule', async function () {
        const addResponse = await device.away.addRule({
          start: 60,
          end: 240,
        });
        expect(addResponse, 'addRule').to.have.property('err_code', 0);
        expect(addResponse, 'addRule').to.have.property('id');

        const deleteResponse = await device.away.deleteRule(addResponse.id);
        expect(deleteResponse).to.have.property('err_code', 0);

        const getResponse = await device.away.getRules();
        expect(getResponse).to.have.property('err_code', 0);
        const rule = getResponse.rule_list.find((r) => r.id === addResponse.id);
        expect(rule).to.be.undefined;
      });
    });
    describe('#setOverallEnable()', function () {
      it('should enable', async function () {
        expect(await device.away.setOverallEnable(true)).to.have.property(
          'err_code',
          0,
        );
      });
      it('should disable', async function () {
        expect(await device.away.setOverallEnable(false)).to.have.property(
          'err_code',
          0,
        );
      });
    });
  });
};
