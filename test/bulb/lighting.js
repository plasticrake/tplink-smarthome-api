/* eslint-env mocha */
/* eslint no-unused-expressions: ["off"] */
'use strict';

const { expect, sinon } = require('../setup');

module.exports = function () {
  describe('Lighting', function () {
    this.timeout(5000);
    this.slow(2000);

    describe('#setLightState()', async function () {
      it('should turn on', async function () {
        expect(await this.device.lighting.setLightState({on_off: true, ignore_default: true})).to.be.true;
        expect(await this.device.lighting.getLightState()).to.have.property('on_off', 1);
      });

      it('should turn off', async function () {
        expect(await this.device.lighting.setLightState({on_off: false, transition_period: 100})).to.be.true;
        expect(await this.device.lighting.getLightState()).to.have.property('on_off', 0);
      });

      it('should change brightness if suported', async function () {
        if (!this.device.supportsBrightness) return;

        expect(await this.device.lighting.setLightState({on_off: 1, brightness: 20})).to.be.true;
        let ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
        expect(ls).to.have.property('brightness', 20);

        expect(await this.device.lighting.setLightState({on_off: 1, brightness: 60})).to.be.true;
        ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
        expect(ls).to.have.property('brightness', 60);
      });

      it('should change color temperature if suported', async function () {
        if (!this.device.supportsColorTemperature) return;

        expect(await this.device.lighting.setLightState({on_off: 1, color_temp: 4000})).to.be.true;
        let ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
        expect(ls).to.have.property('color_temp', 4000);

        expect(await this.device.lighting.setLightState({on_off: 1, color_temp: 5000})).to.be.true;
        ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
        expect(ls).to.have.property('color_temp', 5000);
      });

      it('should change color if suported', async function () {
        if (!this.device.supportsColor) return;

        expect(await this.device.lighting.setLightState({on_off: 1, hue: 100, saturation: 40, brightness: 20})).to.be.true;
        let ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
        expect(ls).to.have.property('hue', 100);
        expect(ls).to.have.property('saturation', 40);
        expect(ls).to.have.property('brightness', 20);

        expect(await this.device.lighting.setLightState({on_off: 1, hue: 200, saturation: 50, brightness: 60})).to.be.true;
        ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
        expect(ls).to.have.property('hue', 200);
        expect(ls).to.have.property('saturation', 50);
        expect(ls).to.have.property('brightness', 60);
      });

      it('should emit lightstate-on / lightstate-off / lightstate-change / lightstate-update', async function () {
        let spyOn = sinon.spy();
        let spyOff = sinon.spy();
        let spyChange = sinon.spy();
        let spyUpdate = sinon.spy();

        await this.device.lighting.setLightState({on_off: 0});

        this.device.on('lightstate-on', spyOn);
        this.device.on('lightstate-off', spyOff);
        this.device.on('lightstate-change', spyChange);
        this.device.on('lightstate-update', spyUpdate);

        await this.device.lighting.setLightState({on_off: 0});
        await this.device.lighting.setLightState({on_off: 1});
        await this.device.lighting.setLightState({on_off: 1});
        await this.device.lighting.setLightState({on_off: 0});
        await this.device.lighting.setLightState({on_off: 0});
        await this.device.lighting.setLightState({on_off: 1});

        expect(spyOn).to.be.calledTwice;
        expect(spyOn).to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyOff).to.be.calledOnce;
        expect(spyOff).to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyChange).to.be.calledThrice;
        expect(spyChange).to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyUpdate).to.have.callCount(6);
        expect(spyUpdate).to.be.always.calledWithMatch(sinon.match.has('on_off'));
      });
    });

    describe('#getLightState()', function () {
      this.timeout(2000);
      this.slow(1000);
      it('should return light state when on', async function () {
        await this.device.lighting.setLightState({on_off: 1});
        let ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 1);
      });

      it('should return light state when off', async function () {
        await this.device.lighting.setLightState({on_off: 0});
        let ls = await this.device.lighting.getLightState();
        expect(ls).to.have.property('on_off', 0);
      });

      it('should emit lightstate-on / lightstate-off / lightstate-change / lightstate-update', async function () {
        let spyOn = sinon.spy();
        let spyOff = sinon.spy();
        let spyChange = sinon.spy();
        let spyUpdate = sinon.spy();

        await this.device.lighting.setLightState({on_off: 0});

        this.device.on('lightstate-on', spyOn);
        this.device.on('lightstate-off', spyOff);
        this.device.on('lightstate-change', spyChange);
        this.device.on('lightstate-update', spyUpdate);

        await this.device.lighting.getLightState();
        await this.device.lighting.getLightState();
        this.device.lighting._lastState.lightState.on_off = 1;
        this.device.lighting._lastState.powerOn = true;
        await this.device.lighting.getLightState();
        await this.device.lighting.getLightState();

        expect(spyOn, 'spyOn').to.not.be.called;

        expect(spyOff, 'spyOff').to.be.calledOnce;
        expect(spyOff, 'spyOff').to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyChange, 'spyChange').to.be.calledOnce;
        expect(spyChange, 'spyChange').to.be.always.calledWithMatch(sinon.match.has('on_off'));

        expect(spyUpdate, 'spyUpdate').to.have.callCount(4);
        expect(spyUpdate, 'spyUpdate').to.be.always.calledWithMatch(sinon.match.has('on_off'));
      });
    });
  });
};
