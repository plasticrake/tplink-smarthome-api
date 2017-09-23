'use strict';

const Device = require('./device');

/**
 * Bulb Device.
 *
 * TP-Link models: LB100, LB110, LB120.
 * @extends Device
 * @extends EventEmitter
 */
class Bulb extends Device {
  /**
   * Created by {@link Client} - Do not instantiate directly.
   *
   * See {@link Device#constructor} for common options.
   * @see Device#constructor
   * @param  {Object} options
   */
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

  /**
   * @private
   */
  set sysInfo (sysInfo) {
    super.sysInfo = sysInfo;
    this.emitEvents();
  }

  /**
   * @private
   */
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
  /**
   * Get Bulb light state.
   *
   * Requests `lightingservice.get_light_state`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getLightState () {
    this.lightState = await this.sendCommand('{"smartlife.iot.smartbulb.lightingservice":{"get_light_state":{}}}');
    this.emitEvents();
    return this.lightState;
  }
  /**
   * Sets Bulb light state (on/off, brightness, color, etc).
   *
   * Sends `lightingservice.transition_light_state` command.
   * @param  {Object}  options
   * @param  {number}  options.ignore_default    1=true, 0=false
   * @param  {number}  options.transition_period
   * @param  {number}  options.on_off            1=on, 0=off
   * @param  {string}  options.mode
   * @param  {number}  options.hue               0-360
   * @param  {number}  options.saturation        0-100
   * @param  {number}  options.brightness        0-100
   * @param  {number}  options.color_temp        0-7000 (Kelvin)
   * @return {Promise<boolean, ResponseError>}
   */
  async setLightState (options) {
    let state = {};
    state.ignore_default = options.ignore_default || 1;
    state.transition_period = options.transition_period || 0;
    if (options.on_off !== undefined) state.on_off = options.on_off;
    if (options.mode !== undefined) state.mode = options.mode;
    if (options.hue !== undefined) state.hue = options.hue;
    if (options.saturation !== undefined) state.saturation = options.saturation;
    if (options.brightness !== undefined) state.brightness = options.brightness;
    if (options.color_temp !== undefined) state.color_temp = options.color_temp;

    const payload = {
      'smartlife.iot.smartbulb.lightingservice': {
        'transition_light_state': state
      }
    };

    this.lightState = await this.sendCommand(payload);
    this.emitEvents();
    return true;
  }
  /**
   * Gets on/off state of Bulb.
   *
   * Requests `lightingservice.get_light_state` and returns true if `on_off === 1`.
   * @return {Promise<boolean, ResponseError>}
   */
  async getPowerState () {
    let lightState = await this.getLightState();
    return (lightState.on_off === 1);
  }
  /**
   * Sets on/off state of Bulb.
   *
   * Sends `lightingservice.transition_light_state` command with on_off `value`.
   * @param  {boolean}  value true: on, false: off
   * @return {Promise<boolean, ResponseError>}
   */
  async setPowerState (value) {
    return this.setLightState({on_off: (value ? 1 : 0)});
  }
}

module.exports = Bulb;
