'use strict';

const Device = require('./device');

/**
 * Plug Device.
 *
 * TP-Link models: HS100, HS105, HS110, HS200.
 *
 * Emits events after device status is queried, such as {@link #getSysInfo} and {@link #getEmeterRealtime}.
 * @extends Device
 * @extends EventEmitter
 * @emits  Plug#power-on
 * @emits  Plug#power-off
 * @emits  Plug#power-update
 * @emits  Plug#in-use
 * @emits  Plug#not-in-use
 * @emits  Plug#in-use-update
 * @emits  Plug#emeter-realtime-update
 */
class Plug extends Device {
  /**
   * Created by {@link Client} - Do not instantiate directly.
   *
   * See {@link Device#constructor} for common options.
   * @param  {Object} options
   * @param  {Number} [options.inUseThreshold=0]
   */
  constructor (options) {
    super(options);
    if (typeof options === 'undefined') options = {};

    this.log.debug('plug.constructor()');

    this.apiModuleNamespace = {
      'system': 'system',
      'cloud': 'cnCloud',
      'schedule': 'schedule',
      'timesetting': 'time',
      'emeter': 'emeter',
      'netif': 'netif'
    };

    this.inUseThreshold = options.inUseThreshold || 0;

    this.lastState = Object.assign(this.lastState, { powerOn: null, inUse: null });

    this.emitEventsEnabled = true;
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
    this.supportsEmeter = (sysInfo.feature && typeof sysInfo.feature === 'string' ? sysInfo.feature.indexOf('ENE') >= 0 : false);
    this.log.debug('[%s] plug sysInfo set', this.alias);
    this.emitEvents();
  }
  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @return {Object}
   */
  get emeterRealtime () {
    return super.emeterRealtime;
  }
  /**
   * @private
   */
  set emeterRealtime (emeterRealtime) {
    this.log.debug('[%s] plug emeterRealtime set, supportsEmeter: %s', this.alias, this.supportsEmeter);
    if (this.supportsEmeter) {
      super.emeterRealtime = emeterRealtime;
      this.emitEvents();
    }
  }
  /**
   * Determines if device is in use based on cached `emeter.get_realtime` results.
   *
   * If device supports energy monitoring (HS110): `power > inUseThreshold`
   *
   * Otherwise fallback on relay state:  `relay_state === 1`
   * @return {boolean}
   */
  get inUse () {
    if (this.supportsEmeter) {
      return (this.emeterRealtime.power > this.inUseThreshold);
    }
    return (this.sysInfo.relay_state === 1);
  }
  /**
   * Requests common Plug status details in a single request.
   * - `system.get_sysinfo`
   * - `cloud.get_sysinfo`
   * - `emeter.get_realtime`
   * - `schedule.get_next_action`
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async getInfo () {
    // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
    let data = await this.send('{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}');
    this.sysInfo = data.system.get_sysinfo;
    this.cloudInfo = data.cnCloud.get_info;
    this.emeterRealtime = data.emeter.get_realtime;
    this.scheduleNextAction = data.schedule.get_next_action;
    return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, emeterRealtime: this.emeterRealtime, scheduleNextAction: this.scheduleNextAction};
  }
  /**
   * Get Away Rules.
   *
   * Requests `anti_theft.get_rules`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getAwayRules () {
    return this.sendCommand(`{"anti_theft":{"get_rules":{}}}`);
  }
  /**
   * Same as {@link #inUse}, but requests current `emeter.get_realtime`.
   * @return {Promise<boolean, ResponseError>}
   */
  async getInUse () {
    if (this.supportsEmeter) {
      await this.getEmeterRealtime();
    } else {
      await this.getSysInfo();
    }
    return this.inUse;
  }
  /**
   * Get Plug LED state (night mode).
   *
   * Requests `system.sys_info` and returns true if `led_off === 0`.
   * @return {Promise<boolean, ResponseError>} LED State, true === on
   */
  async getLedState () {
    let sysInfo = await this.getSysInfo();
    return (sysInfo.led_off === 0);
  }
  /**
   * Turn Plug LED on/off (night mode).
   *
   * Sends `system.set_led_off` command.
   * @param  {boolean}  value LED State, true === on
   * @return {Promise<boolean, ResponseError>}
   */
  async setLedState (value) {
    await this.sendCommand(`{"system":{"set_led_off":{"off":${(value ? 0 : 1)}}}}`);
    this.sysInfo.set_led_off = (value ? 0 : 1);
    return true;
  }
  /**
   * Get Plug relay state (on/off).
   *
   * Requests `system.get_sysinfo` and returns true if `relay_state === 1`.
   * @return {Promise<boolean, ResponseError>}
   */
  async getPowerState () {
    let sysInfo = await this.getSysInfo();
    return (sysInfo.relay_state === 1);
  }
  /**
   * Turns Plug relay on/off.
   *
   * Sends `system.set_relay_state` command.
   * @param  {boolean}  value
   * @return {Promise<boolean, ResponseError>}
   */
  async setPowerState (value) {
    this.log.debug('[%s] plug.setPowerState(%s)', this.alias, value);
    await this.sendCommand(`{"system":{"set_relay_state":{"state":${(value ? 1 : 0)}}}}`);
    this.sysInfo.relay_state = (value ? 1 : 0);
    this.emitEvents();
    return true;
  }
  /**
   * Toggles Plug relay state.
   *
   * Requests `system.get_sysinfo` sets the power state to the opposite `relay_state === 1 and return the new power state`.
   * @return {Promise<boolean, ResponseError>}
   */
  async togglePowerState () {
    const powerState = await this.getPowerState();
    this.setPowerState(!powerState);
    return !powerState;
  }
  /**
   * Get Timer Rules.
   *
   * Requests `count_down.get_rules`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getTimerRules () {
    return this.sendCommand(`{"count_down":{"get_rules":{}}}`);
  }
  /**
   * Blink Plug LED.
   *
   * Sends `system.set_led_off` command alternating on and off number of `times` at `rate`,
   * then sets the led to its pre-blink state.
   *
   * Note: `system.set_led_off` is particulally slow, so blink rate is not guaranteed.
   * @param  {number}  [times=5]
   * @param  {number}  [rate=1000]
   * @return {Promise<boolean, ResponseError>}
   */
  async blink (times = 5, rate = 1000) {
    let delay = (t) => { return new Promise((resolve) => { setTimeout(resolve, t); }); };

    let origLedState = await this.getLedState();
    let lastBlink = Date.now();

    let currLedState = false;
    for (var i = 0; i < times * 2; i++) {
      currLedState = !currLedState;
      lastBlink = Date.now();
      await this.setLedState(currLedState);
      let timeToWait = (rate / 2) - (Date.now() - lastBlink);
      if (timeToWait > 0) {
        await delay(timeToWait);
      }
    }
    if (currLedState !== origLedState) {
      await this.setLedState(origLedState);
    }
    return true;
  }
  /**
   * Plug's relay was turned on.
   * @event Plug#power-on
   */
  /**
   * Plug's relay was turned off.
   * @event Plug#power-off
   */
  /**
   * Plug's relay state was updated from device. Fired regardless if status was changed.
   * @event Plug#power-update
   * @property {boolean} value Relay State
   */
  /**
   * Plug's relay was turned on _or_ power draw exceeded `inUseThreshold` for HS110
   * @event Plug#in-use
   */
  /**
   * Plug's relay was turned off _or_ power draw fell below `inUseThreshold` for HS110
   * @event Plug#not-in-use
   */
  /**
   * Plug's in-use state was updated from device. Fired regardless if status was changed.
   * @event Plug#in-use-update
   * @property {boolean} value In Use State
   */
  /**
   * Plug's Energy Monitoring Details were updated from device. Fired regardless if status was changed.
   * @event Plug#emeter-realtime-update
   * @property {Object} value emeterRealtime
   */
  /**
   * @private
   */
  emitEvents () {
    if (!this.emitEventsEnabled) { return; }

    const inUse = this.inUse;
    const powerOn = (this.sysInfo.relay_state === 1);

    this.log.debug('[%s] plug.emitEvents() inUse: %s powerOn: %s lastState: %j', this.alias, inUse, powerOn, this.lastState);
    if (this.lastState.inUse !== inUse) {
      this.lastState.inUse = inUse;
      if (inUse) {
        this.emit('in-use');
      } else {
        this.emit('not-in-use');
      }
    }
    this.emit('in-use-update', inUse);

    if (this.lastState.powerOn !== powerOn) {
      this.lastState.powerOn = powerOn;
      if (powerOn) {
        this.emit('power-on');
      } else {
        this.emit('power-off');
      }
    }
    this.emit('power-update', powerOn);
  }
}

module.exports = Plug;
