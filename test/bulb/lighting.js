/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { config, expect } = require('../setup');

module.exports = function (ctx) {
  describe('Lighting', function () {
    let device;

    beforeEach('Lighting', async function () {
      device = ctx.device;
    });

    describe('#setLightState()', async function () {
      it('should turn on', async function () {
        expect(
          await device.lighting.setLightState({
            on_off: true,
            ignore_default: true,
          })
        ).to.be.true;
        expect(await device.lighting.getLightState()).to.have.property(
          'on_off',
          1
        );
      });

      it('should turn off', async function () {
        expect(
          await device.lighting.setLightState({
            on_off: false,
            transition_period: 100,
          })
        ).to.be.true;
        expect(await device.lighting.getLightState()).to.have.property(
          'on_off',
          0
        );
      });

      it('should change brightness if supported', async function () {
        if (!device.supportsBrightness) return;

        expect(
          await device.lighting.setLightState({
            on_off: 1,
            brightness: 20,
          })
        ).to.be.true;
        let si = await device.getSysInfo();
        expect(si.light_state).to.have.property('on_off', 1);
        expect(si.light_state).to.have.property('brightness', 20);

        expect(
          await device.lighting.setLightState({
            on_off: 1,
            brightness: 60,
          })
        ).to.be.true;
        si = await device.getSysInfo();
        expect(si.light_state).to.have.property('on_off', 1);
        expect(si.light_state).to.have.property('brightness', 60);
      });

      it('should change color temperature if supported', async function () {
        if (!device.supportsColorTemperature) return;

        expect(
          await device.lighting.setLightState({
            on_off: 1,
            color_temp: 4000,
          })
        ).to.be.true;
        let si = await device.getSysInfo();
        expect(si.light_state).to.have.property('on_off', 1);
        expect(si.light_state).to.have.property('color_temp', 4000);

        expect(
          await device.lighting.setLightState({
            on_off: 1,
            color_temp: 5000,
          })
        ).to.be.true;
        si = await device.getSysInfo();
        expect(si.light_state).to.have.property('on_off', 1);
        expect(si.light_state).to.have.property('color_temp', 5000);
      });

      it('should change color if supported', async function () {
        if (!device.supportsColor) return;

        expect(
          await device.lighting.setLightState({
            on_off: 1,
            hue: 100,
            saturation: 40,
            brightness: 20,
          })
        ).to.be.true;
        let si = await device.getSysInfo();
        expect(si.light_state).to.have.property('on_off', 1);
        expect(si.light_state).to.have.property('hue', 100);
        expect(si.light_state).to.have.property('saturation', 40);
        expect(si.light_state).to.have.property('brightness', 20);

        expect(
          await device.lighting.setLightState({
            on_off: 1,
            hue: 200,
            saturation: 50,
            brightness: 60,
          })
        ).to.be.true;
        si = await device.getSysInfo();
        expect(si.light_state).to.have.property('on_off', 1);
        expect(si.light_state).to.have.property('hue', 200);
        expect(si.light_state).to.have.property('saturation', 50);
        expect(si.light_state).to.have.property('brightness', 60);
      });

      it('should emit lightstate-on / lightstate-off / lightstate-change / lightstate-update', async function () {
        const spyOn = sinon.spy();
        const spyOff = sinon.spy();
        const spyChange = sinon.spy();
        const spyUpdate = sinon.spy();

        await device.lighting.setLightState({ on_off: 0 });

        device.on('lightstate-on', spyOn);
        device.on('lightstate-off', spyOff);
        device.on('lightstate-change', spyChange);
        device.on('lightstate-update', spyUpdate);

        await device.lighting.setLightState({ on_off: 0 });
        await device.lighting.setLightState({ on_off: 1 });
        await device.lighting.setLightState({ on_off: 1 });
        await device.lighting.setLightState({ on_off: 0 });
        await device.lighting.setLightState({ on_off: 0 });
        await device.lighting.setLightState({ on_off: 1 });

        expect(spyOn).to.be.calledTwice;
        expect(spyOn).to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyOff).to.be.calledOnce;
        expect(spyOff).to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyChange).to.be.calledThrice;
        expect(spyChange).to.be.always.calledWithMatch(
          sinon.match.has('on_off')
        );

        expect(spyUpdate).to.have.callCount(6);
        expect(spyUpdate).to.be.always.calledWithMatch(
          sinon.match.has('on_off')
        );
      });
    });

    describe('#getLightState()', function () {
      it('should return light state when on', async function () {
        await device.lighting.setLightState({ on_off: 1 });
        const ls = await device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
      });

      it('should return light state when off', async function () {
        await device.lighting.setLightState({ on_off: 0 });
        const ls = await device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 0);
      });

      it('should emit lightstate-on / lightstate-off / lightstate-change / lightstate-update', async function () {
        this.timeout(config.defaultTestTimeout * 2);
        this.slow(config.defaultTestTimeout);
        const spyOn = sinon.spy();
        const spyOff = sinon.spy();
        const spyChange = sinon.spy();
        const spyUpdate = sinon.spy();

        await device.lighting.getLightState();
        await device.lighting.setLightState({ on_off: 0 });

        device.on('lightstate-on', spyOn);
        device.on('lightstate-off', spyOff);
        device.on('lightstate-change', spyChange);
        device.on('lightstate-update', spyUpdate);

        await device.lighting.getLightState();
        await device.lighting.getLightState();
        device.lighting.lastState.lightState.on_off = 1;
        device.lighting.lastState.powerOn = true;
        await device.lighting.getLightState();
        await device.lighting.getLightState();

        expect(spyOn, 'spyOn').to.not.be.called;

        expect(spyOff, 'spyOff').to.be.calledOnce;
        expect(spyOff, 'spyOff').to.be.always.calledWithMatch(
          sinon.match.has('on_off')
        );

        expect(spyChange, 'spyChange').to.be.calledOnce;
        expect(spyChange, 'spyChange').to.be.always.calledWithMatch(
          sinon.match.has('on_off')
        );

        expect(spyUpdate, 'spyUpdate').to.have.callCount(4);
        expect(spyUpdate, 'spyUpdate').to.be.always.calledWithMatch(
          sinon.match.has('on_off')
        );
      });
    });

    describe('#getLightDetails()', function () {
      it('should return light details', async function () {
        const ld = await device.lighting.getLightDetails();
        expect(ld).to.have.property('max_lumens');
      });
    });
  });
};
