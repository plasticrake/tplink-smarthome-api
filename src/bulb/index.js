'use strict';

const Device = require('../device');
const Cloud = require('../shared/cloud');
const Emeter = require('../shared/emeter');
const Lighting = require('./lighting');
const Schedule = require('./schedule');
const Time = require('../shared/time');

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
   * See [Device constructor]{@link Device} for common options.
   * @see Device
   * @param  {Object} options
   */
  constructor ({ client, sysInfo, host, port, logger, defaultSendOptions }) {
    super({ client, host, port, logger, defaultSendOptions }); // sysInfo omitted

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

    /**
     * @borrows Cloud#getInfo as Bulb.cloud#getInfo
     * @borrows Cloud#bind as Bulb.cloud#bind
     * @borrows Cloud#unbind as Bulb.cloud#unbind
     * @borrows Cloud#getFirmwareList as Bulb.cloud#getFirmwareList
     * @borrows Cloud#setServerUrl as Bulb.cloud#setServerUrl
     */
    this.cloud = new Cloud(this, 'smartlife.iot.common.cloud');
    /**
     * Bulb's Energy Monitoring Details were updated from device. Fired regardless if status was changed.
     * @event Bulb#emeter-realtime-update
     * @property {Object} value emeterRealtime
     */
    /**
     * @borrows Emeter#realtime as Bulb.emeter#realtime
     * @borrows Emeter#getRealtime as Bulb.emeter#getRealtime
     * @borrows Emeter#getDayStats as Bulb.emeter#getDayStats
     * @borrows Emeter#getMonthStats as Bulb.emeter#getMonthStats
     * @borrows Emeter#eraseStats as Bulb.emeter#eraseStats
     */
    this.emeter = new Emeter(this, 'smartlife.iot.common.emeter');
    /**
     * @borrows Lighting#lightState as Bulb.lighting#lightState
     * @borrows Lighting#getLightState as Bulb.lighting#getLightState
     * @borrows Lighting#setLightState as Bulb.lighting#setLightState
     */
    this.lighting = new Lighting(this, 'smartlife.iot.smartbulb.lightingservice');
    /**
     * @borrows Schedule#getNextAction as Bulb.schedule#getNextAction
     * @borrows Schedule#getRules as Bulb.schedule#getRules
     * @borrows Schedule#getRule as Bulb.schedule#getRule
     * @borrows BulbSchedule#addRule as Bulb.schedule#addRule
     * @borrows BulbSchedule#editRule as Bulb.schedule#editRule
     * @borrows Schedule#deleteAllRules as Bulb.schedule#deleteAllRules
     * @borrows Schedule#deleteRule as Bulb.schedule#deleteRule
     * @borrows Schedule#setOverallEnable as Bulb.schedule#setOverallEnable
     * @borrows Schedule#getDayStats as Bulb.schedule#getDayStats
     * @borrows Schedule#getMonthStats as Bulb.schedule#getMonthStats
     * @borrows Schedule#eraseStats as Bulb.schedule#eraseStats
     */
    this.schedule = new Schedule(this, 'smartlife.iot.common.schedule');
    /**
     * @borrows Time#getTime as Bulb.time#getTime
     * @borrows Time#getTimezone as Bulb.time#getTimezone
     */
    this.time = new Time(this, 'smartlife.iot.common.timesetting');

    this.lastState = Object.assign(this.lastState, { powerOn: null, inUse: null });

    if (sysInfo) { this.sysInfo = sysInfo; }
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
    // TODO / XXX Verify that sysInfo.light_state can be set here to trigger events
    this.lighting.lightState = sysInfo.light_state;
  }
  /**
   * Cached value of `sys_info.is_dimmable === 1`
   * @return {boolean}
   */
  get supportsBrightness () {
    return (this.sysInfo.is_dimmable === 1);
  }
  /**
   * Cached value of `sys_info.is_color === 1`
   * @return {boolean}
   */
  get supportsColor () {
    return (this.sysInfo.is_color === 1);
  }
  /**
   * Cached value of `sys_info.is_variable_color_temp === 1`
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
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async getInfo (sendOptions) {
    // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
    const data = await this.send(`{"${this.apiModuleNamespace.emeter}":{"get_realtime":{}},"${this.apiModuleNamespace.lightingservice}":{"get_light_state":{}},"${this.apiModuleNamespace.schedule}":{"get_next_action":{}},"system":{"get_sysinfo":{}},"${this.apiModuleNamespace.cloud}":{"get_info":{}}}`, sendOptions);
    this.sysInfo = data.system.get_sysinfo;
    this.cloud.info = data[this.apiModuleNamespace.cloud].get_info;
    this.emeter.realtime = data[this.apiModuleNamespace.emeter].get_realtime;
    this.schedule.nextAction = data[this.apiModuleNamespace.schedule].get_next_action;
    this.lighting.lightState = data[this.apiModuleNamespace.lightingservice].get_light_state;
    return {
      sysInfo: this.sysInfo,
      cloud: { info: this.cloud.info },
      emeter: { realtime: this.emeter.realtime },
      schedule: { nextAction: this.schedule.nextAction },
      lighting: { lightState: this.lighting.lightState }
    };
  }
  /**
   * Gets on/off state of Bulb.
   *
   * Requests `lightingservice.get_light_state` and returns true if `on_off === 1`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async getPowerState (sendOptions) {
    const lightState = await this.lighting.getLightState(sendOptions);
    return (lightState.on_off === 1);
  }
  /**
   * Sets on/off state of Bulb.
   *
   * Sends `lightingservice.transition_light_state` command with on_off `value`.
   * @param  {boolean}     value          true: on, false: off
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setPowerState (value, sendOptions) {
    return this.lighting.setLightState({ on_off: (value ? 1 : 0) }, sendOptions);
  }
  /**
   * Toggles state of Bulb.
   *
   * Requests `lightingservice.get_light_state` sets the power state to the opposite of `on_off === 1` and returns the new power state.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async togglePowerState (sendOptions) {
    const powerState = await this.getPowerState(sendOptions);
    await this.setPowerState(!powerState, sendOptions);
    return !powerState;
  }
}

module.exports = Bulb;
