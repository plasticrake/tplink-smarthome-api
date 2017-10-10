'use strict';

const isEqual = require('lodash.isequal');

const Device = require('./device');

/**
 * Bulb Device.
 *
 * TP-Link models: LB100, LB110, LB120, LB130.
 * @extends Device
 * @extends EventEmitter
 * @emits  Bulb#lightstate-on
 * @emits  Bulb#lightstate-off
 * @emits  Bulb#lightstate-change
 * @emits  Bulb#lightstate-update
 * @emits  Bulb#emeter-realtime-update
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

    this.supportsEmeter = true;

    this.apiModuleNamespace = {
      'system': 'smartlife.iot.common.system',
      'cloud': 'smartlife.iot.common.cloud',
      'schedule': 'smartlife.iot.common.schedule',
      'timesetting': 'smartlife.iot.common.timesetting',
      'emeter': 'smartlife.iot.common.emeter',
      'netif': 'netif',
      'lightingservice': 'smartlife.iot.smartbulb.lightingservice'
    };

    this._lightState = {};

    this.lastState = Object.assign(this.lastState, { powerOn: null, inUse: null });
  }
  /**
   * Returns cached results from last retrieval of `system.sys_info`.
   * @return {Object} system.sys_info
   */
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
   * Returns cached results from last retrieval of `smartlife.iot.smartbulb.lightingservice.get_light_state`.
   * @return {Object}
   */
  get lightState () {
    return this._lightState;
  }
  /**
   * @private
   */
  set lightState (lightState) {
    this.log.debug('[%s] bulb lightState set', this.alias);
    this._lightState = lightState;
    this.emitEvents();
  }
  /**
   * sys_info.is_dimmable === 1
   * @return {boolean}
   */
  get supportsBrightness () {
    return (this.sysInfo.is_dimmable === 1);
  }
  /**
   * sys_info.is_color === 1
   * @return {boolean}
   */
  get supportsColor () {
    return (this.sysInfo.is_color === 1);
  }
  /**
   * sys_info.is_variable_color_temp === 1
   * @return {boolean}
   */
  get supportsColorTemperature () {
    return (this.sysInfo.is_variable_color_temp === 1);
  }
  /**
   * Returns array with min and max supported color temperatures
   * @return {?{min: Number, max: Number}} range
   */
  get getColorTemperatureRange () {
    if (!this.supportsColorTemperature) return;
    switch (true) {
      case (/LB130/i).test(this.sysInfo.model): return { min: 2500, max: 9000 };
      default: return { min: 2700, max: 6500 };
    }
  }
  /**
   * Requests common Bulb status details in a single request.
   * - `system.get_sysinfo`
   * - `cloud.get_sysinfo`
   * - `emeter.get_realtime`
   * - `schedule.get_next_action`
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async getInfo () {
    // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
    let data = await this.send(`{"${this.apiModuleNamespace.emeter}":{"get_realtime":{}},"${this.apiModuleNamespace.lightingservice}":{"get_light_state":{}},"${this.apiModuleNamespace.schedule}":{"get_next_action":{}},"${this.apiModuleNamespace.system}":{"get_sysinfo":{}},"${this.apiModuleNamespace.cloud}":{"get_info":{}}}`);
    this.sysInfo = data[this.apiModuleNamespace.system].get_sysinfo;
    this.cloudInfo = data[this.apiModuleNamespace.cloud].get_info;
    this.emeterRealtime = data[this.apiModuleNamespace.emeter].get_realtime;
    this.scheduleNextAction = data[this.apiModuleNamespace.schedule].get_next_action;
    this.lightState = data[this.apiModuleNamespace.lightingservice].get_light_state;
    return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, emeterRealtime: this.emeterRealtime, scheduleNextAction: this.scheduleNextAction, lightState: this.lightState};
  }
  /**
   * Get Bulb light state.
   *
   * Requests `lightingservice.get_light_state`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getLightState () {
    this.lightState = await this.sendCommand('{"smartlife.iot.smartbulb.lightingservice":{"get_light_state":{}}}');
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
   * @param  {number}  options.color_temp        Kelvin (LB120:2700-6500 LB130:2500-9000)
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
  /**
   * Toggles state of Bulb.
   *
   * Requests `lightingservice.get_light_state` sets the power state to the opposite of `on_off === 1` and returns the new power state.
   * @return {Promise<boolean, ResponseError>}
   */
  async togglePowerState () {
    const powerState = await this.getPowerState();
    await this.setPowerState(!powerState);
    return !powerState;
  }
  /**
   * Bulb was turned on (`lightstate.on_off`).
   * @event Bulb#lightstate-on
   * @property {Object} value lightstate
   */
  /**
   * Bulb was turned off (`lightstate.on_off`).
   * @event Bulb#lightstate-off
   * @property {Object} value lightstate
   */
  /**
   * Bulb's lightstate was changed.
   * @event Bulb#lightstate-change
   * @property {Object} value lightstate
   */
  /**
   * Bulb's lightstate state was updated from device. Fired regardless if status was changed.
   * @event Bulb#lightstate-update
   * @property {Object} value lightstate
   */
  /**
   * Bulb's Energy Monitoring Details were updated from device. Fired regardless if status was changed.
   * @event Bulb#emeter-realtime-update
   * @property {Object} value emeterRealtime
   */
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
        this.emit('lightstate-on', this.lightState);
      } else {
        this.emit('lightstate-off', this.lightState);
      }
    }

    if (!isEqual(this.lastState.lightState, this.lightState)) {
      this.lastState.lightState = this.lightState;
      this.emit('lightstate-change', this.lightState);
    }
    this.emit('lightstate-update', this.lightState);
  }
}

module.exports = Bulb;
