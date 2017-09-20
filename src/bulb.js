'use strict';

const Device = require('./device');

class Bulb extends Device {
  constructor (options) {
    super(options);
    if (typeof options === 'undefined') options = {};

    this.supportsConsumption = true;

    this.apiModuleNamespace = {
      'system': 'smartlife.iot.common.system',
      'cloud': 'smartlife.iot.common.cloud',
      'schedule': 'smartlife.iot.common.schedule',
      'timesetting': 'smartlife.iot.common.timesetting',
      'emeter': 'smartlife.iot.common.emeter',
      'netif': 'netif'
    };

    this.lightState = {};

    this.lastState = Object.assign(this.lastState, { powerOn: null, inUse: null });
  }

  get sysInfo () {
    return super.sysInfo;
  }

  set sysInfo (sysInfo) {
    super.sysInfo = sysInfo;
    this.emitEvents();
  }

  emitEvents () {
    if (!this.lightState) return;
    let powerOn = (this.lightState.on_off === 1);

    this.log.debug('emitEvents() powerOn: %s lastState: %j', powerOn, this.lastState);

    if (this.lastState.powerOn !== powerOn) {
      this.lastState.powerOn = powerOn;
      if (powerOn) {
        this.emit('power-on', this);
        this.emit('bulb-on', this);
      } else {
        this.emit('power-off', this);
        this.emit('bulb-off', this);
      }
    }

    // using JSON.stringify for now, need device to test actual results
    if (JSON.stringify(this.lastState.lightState) !== JSON.stringify(this.lightState)) {
      this.lastState.lightState = this.lightState;
      this.emit('bulb-change');
    }
  }

  async getLightState () {
    this.lightState = await this.sendCommand('{"smartlife.iot.smartbulb.lightingservice":{"get_light_state":{}}}');
    this.emitEvents();
    return this.lightState;
  }

  async setLightState (options) {
    let state = {};
    state.ignore_default = options.ignore_default || 1;
    state.transition_period = options.transition_period || 0;
    if (options.on_off !== undefined) state.on_off = options.on_off;
    if (options.mode !== undefined) state.mode = options.mode;
    if (options.hue !== undefined) state.hue = options.hue; // hue: 0-360
    if (options.saturation !== undefined) state.saturation = options.saturation; // saturation: 0-100
    if (options.brightness !== undefined) state.brightness = options.brightness; // brightness: 0-100
    if (options.color_temp !== undefined) state.color_temp = options.colorTemp; // temperture: 0-7000

    const payload = {
      'smartlife.iot.smartbulb.lightingservice': {
        'transition_light_state': state
      }
    };

    this.lightState = await this.sendCommand(payload);
    this.emitEvents();
    return true;
  }

  async getPowerState () {
    let lightState = await this.getLightState();
    return (lightState.on_off === 1);
  }

  async setPowerState (value) {
    return this.setLightState({on_off: (value ? 1 : 0)});
  }
}

module.exports = Bulb;
