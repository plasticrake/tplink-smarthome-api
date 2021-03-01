/* eslint-disable no-unused-expressions */
/* eslint-disable no-await-in-loop */

const sinon = require('sinon');
const { expect } = require('../setup');

module.exports = function (ctx) {
  describe('Dimmer', function () {
    let device;

    beforeEach('Dimmer', async function () {
      device = ctx.device;
    });

    describe('#brightness get', function () {
      it('should return brightness', async function () {
        expect(device.dimmer.brightness).to.be.a('number');
        await device.dimmer.setBrightness(50);
        expect(device.dimmer.brightness).to.eql(50);
        await device.dimmer.setBrightness(75);
        expect(device.dimmer.brightness).to.eql(75);
      });
    });

    describe('#setBrightness()', function () {
      it('should set brightness', async function () {
        expect(device.dimmer.setBrightness(50)).to.eventually.have.property(
          'err_code',
          0
        );

        let si = await device.getSysInfo();
        expect(si.brightness).to.eql(50);

        expect(device.dimmer.setBrightness(20)).to.eventually.have.property(
          'err_code',
          0
        );
        si = await device.getSysInfo();
        expect(si.brightness).to.eql(20);
      });

      it('should emit brightness-change / brightness-update', async function () {
        const spyChange = sinon.spy();
        const spyUpdate = sinon.spy();

        const { dimmer } = device;

        await dimmer.setBrightness(50);
        device.on('brightness-change', spyChange);
        device.on('brightness-update', spyUpdate);
        await dimmer.setBrightness(75);
        await dimmer.setBrightness(75);

        expect(spyChange).to.be.calledOnce;
        expect(spyUpdate).to.be.calledTwice;
        expect(spyUpdate).to.be.always.calledWithMatch(sinon.match(75));
      });
    });

    describe('#setDimmerTransition()', function () {
      it('should set brightness', async function () {
        const tran = { brightness: 50, mode: 'gentle_on_off', duration: 1 };
        expect(
          device.dimmer.setDimmerTransition(tran)
        ).to.eventually.have.property('err_code', 0);

        let si = await device.getSysInfo();
        expect(si.brightness).to.eql(50);

        tran.brightness = 20;
        expect(
          device.dimmer.setDimmerTransition(tran)
        ).to.eventually.have.property('err_code', 0);
        si = await device.getSysInfo();
        expect(si.brightness).to.eql(20);
      });

      it('should emit brightness-change / brightness-update', async function () {
        const spyChange = sinon.spy();
        const spyUpdate = sinon.spy();

        const { dimmer } = device;

        await dimmer.setDimmerTransition({
          brightness: 50,
          mode: 'gentle_on_off',
          duration: 1,
        });
        device.on('brightness-change', spyChange);
        device.on('brightness-update', spyUpdate);
        await dimmer.setDimmerTransition({
          brightness: 75,
          mode: 'gentle_on_off',
          duration: 1,
        });
        await dimmer.setDimmerTransition({
          brightness: 75,
          mode: 'gentle_on_off',
          duration: 1,
        });

        expect(spyChange).to.be.calledOnce;
        expect(spyUpdate).to.be.calledTwice;
        expect(spyUpdate).to.be.always.calledWithMatch(sinon.match(75));
      });
    });

    describe('#getDefaultBehavior()', function () {
      it('should get default behavior', async function () {
        const response = await device.dimmer.getDefaultBehavior();
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
          expect(await device.dimmer.setFadeOffTime(fadeTime)).to.have.property(
            'err_code',
            0
          );
          const response = await device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('fadeOffTime', fadeTime);
        }
      });
    });

    describe('#setFadeOnTime()', function () {
      it('should set fadeOnTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(await device.dimmer.setFadeOnTime(fadeTime)).to.have.property(
            'err_code',
            0
          );
          const response = await device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('fadeOnTime', fadeTime);
        }
      });
    });

    describe('#setGentleOffTime()', function () {
      it('should set GentleOffTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(
            await device.dimmer.setGentleOffTime(fadeTime)
          ).to.have.property('err_code', 0);
          const response = await device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('gentleOffTime', fadeTime);
        }
      });
    });

    describe('#setGentleOnTime()', function () {
      it('should set GentleOnTime', async function () {
        for (const fadeTime of [2100, 3200]) {
          expect(
            await device.dimmer.setGentleOnTime(fadeTime)
          ).to.have.property('err_code', 0);
          const response = await device.dimmer.getDimmerParameters();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.property('gentleOnTime', fadeTime);
        }
      });
    });

    describe('#getDimmerParameters()', function () {
      it('should get dimmer parameters', async function () {
        const response = await device.dimmer.getDimmerParameters();
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
            await device.dimmer.setDoubleClickAction(action)
          ).to.have.property('err_code', 0);
          const response = await device.dimmer.getDefaultBehavior();
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
            await device.dimmer.setLongPressAction(action)
          ).to.have.property('err_code', 0);
          const response = await device.dimmer.getDefaultBehavior();
          expect(response).to.have.property('err_code', 0);
          expect(response).to.have.deep.property('long_press', action);
        }
      });
    });

    describe('#setSwitchState()', function () {
      it('should set double_click action', async function () {
        for (const state of [true, false, true]) {
          expect(await device.dimmer.setSwitchState(state)).to.have.property(
            'err_code',
            0
          );
          expect(await device.getPowerState()).to.eql(state);
        }
      });
    });
  });
};
