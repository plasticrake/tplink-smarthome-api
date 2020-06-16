/* eslint-disable no-await-in-loop */
const { expect } = require('../setup');

// const { ResponseError } = require('../../src');

module.exports = function (testDevice) {
  describe('Dimmer', function () {
    describe('#setBrightness()', function () {
      it('should set brightness', async function () {
        expect(
          this.device.dimmer.setBrightness(50)
        ).to.eventually.have.property('err_code', 0);

        let si = await this.device.getSysInfo();
        expect(si.brightness).to.eql(50);

        expect(
          this.device.dimmer.setBrightness(20)
        ).to.eventually.have.property('err_code', 0);
        si = await this.device.getSysInfo();
        expect(si.brightness).to.eql(20);
      });
    });

    describe('#setDimmerTransition()', function () {
      it('should set brightness', async function () {
        const tran = { brightness: 50, mode: 'gentle_on_off', duration: 1 };
        expect(
          this.device.dimmer.setDimmerTransition(tran)
        ).to.eventually.have.property('err_code', 0);

        let si = await this.device.getSysInfo();
        expect(si.brightness).to.eql(50);

        tran.brightness = 20;
        expect(
          this.device.dimmer.setDimmerTransition(tran)
        ).to.eventually.have.property('err_code', 0);
        si = await this.device.getSysInfo();
        expect(si.brightness).to.eql(20);
      });
    });

    describe('#getDefaultBehavior()', function () {
      it('should get default behavior', async function () {
        const response = await this.device.dimmer.getDefaultBehavior();
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.keys(
          'double_click',
          'hard_on',
          'long_press',
          'soft_on',
          'err_code'
        );
      });
    });

    describe('#setFadeOffTime()', function () {
      it('should set fadeOffTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(
            await this.device.dimmer.setFadeOffTime(fadeTime)
          ).to.have.property('err_code', 0);
          const response = await this.device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('fadeOffTime', fadeTime);
        }
      });
    });

    describe('#setFadeOnTime()', function () {
      it('should set fadeOnTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(
            await this.device.dimmer.setFadeOnTime(fadeTime)
          ).to.have.property('err_code', 0);
          const response = await this.device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('fadeOnTime', fadeTime);
        }
      });
    });

    describe('#setGentleOffTime()', function () {
      it('should set GentleOffTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(
            await this.device.dimmer.setGentleOffTime(fadeTime)
          ).to.have.property('err_code', 0);
          const response = await this.device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('gentleOffTime', fadeTime);
        }
      });
    });

    describe('#setGentleOnTime()', function () {
      it('should set GentleOnTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(
            await this.device.dimmer.setGentleOnTime(fadeTime)
          ).to.have.property('err_code', 0);
          const response = await this.device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('gentleOnTime', fadeTime);
        }
      });
    });

    describe('#getDimmerParameters()', function () {
      it('should get dimmer parameters', async function () {
        const response = await this.device.dimmer.getDimmerParameters();
        expect(response).to.have.property('err_code', 0);
        expect(response).to.have.keys(
          'err_code',
          'bulb_type',
          'minThreshold',
          'fadeOnTime',
          'fadeOffTime',
          'gentleOnTime',
          'gentleOffTime',
          'rampRate'
        );
      });
    });

    describe('#setDoubleClickAction()', function () {
      it('should set double_click action', async function () {
        for (const action of [
          { mode: 'none' },
          { mode: 'instant_on_off' },
          { mode: 'gentle_on_off' },
          { mode: 'customize_preset', index: 2 },
        ]) {
          expect(
            await this.device.dimmer.setDoubleClickAction(action)
          ).to.have.property('err_code', 0);
          const response = await this.device.dimmer.getDefaultBehavior();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.deep.property('double_click', action);
        }
      });
    });

    describe('#setLongPressAction()', function () {
      it('should set double_click action', async function () {
        for (const action of [
          { mode: 'none' },
          { mode: 'instant_on_off' },
          { mode: 'gentle_on_off' },
          { mode: 'customize_preset', index: 2 },
        ]) {
          expect(
            await this.device.dimmer.setLongPressAction(action)
          ).to.have.property('err_code', 0);
          const response = await this.device.dimmer.getDefaultBehavior();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.deep.property('long_press', action);
        }
      });
    });

    describe('#setSwitchState()', function () {
      it('should set double_click action', async function () {
        for (const state of [true, false, true]) {
          expect(
            await this.device.dimmer.setSwitchState(state)
          ).to.have.property('err_code', 0);
          expect(await this.device.getPowerState()).to.eql(state);
        }
      });
    });
  });
};
