const { config, expect } = require('../setup');

module.exports = function (testDevice) {
  describe('Schedule', function () {
    let lightState;

    before('Schedule', async function () {
      if (!testDevice.getDevice) {
        this.skip();
        return;
      }
      const device = await testDevice.getDevice();
      await device.schedule.deleteAllRules();
    });

    beforeEach('Schedule', function () {
      lightState = {
        saturation: 0,
        hue: 0,
        brightness: 0,
        color_temp: 0,
        mode: 'last_status',
        on_off: 0,
      };
    });

    describe('#addRule()', function () {
      it('should add non repeating rule', async function () {
        const response = await this.device.schedule.addRule({
          lightState,
          start: 60,
        });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add repeating rule', async function () {
        const response = await this.device.schedule.addRule({
          lightState,
          start: 120,
          daysOfWeek: [0, 6],
        });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
      it('should add disabled rule', async function () {
        const response = await this.device.schedule.addRule({
          lightState,
          start: 120,
          name: 'disabled',
          enable: false,
        });
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.property('id');
      });
    });

    describe('#editRule()', function () {
      it('should edit a rule', async function () {
        this.timeout(config.defaultTestTimeout * 2);
        this.slow(config.defaultTestTimeout);

        const addResponse = await this.device.schedule.addRule({
          lightState,
          start: 60,
        });
        expect(addResponse).to.have.property('err_code', 0);
        expect(addResponse).to.have.property('id');

        lightState.hue = 100;
        const editResponse = await this.device.schedule.editRule({
          id: addResponse.id,
          lightState,
          start: 120,
        });
        expect(editResponse).to.have.property('err_code', 0);

        const getResponse = await this.device.schedule.getRule(addResponse.id);
        expect(getResponse).to.have.property('err_code', 0);
        expect(getResponse).to.have.property('id', addResponse.id);
        expect(getResponse.s_light.hue).to.eql(100);
        expect(getResponse.smin).to.eql(120);
      });
    });
  });
};
