'use strict';

const Device = require('../device');
const Away = require('./away');
const Cloud = require('../shared/cloud');
const Dimmer = require('./dimmer');
const Emeter = require('../shared/emeter');
const Schedule = require('./schedule');
const Timer = require('./timer');
const Time = require('../shared/time');
const { ResponseError } = require('../utils');

/**
 * Plug Device.
 *
 * TP-Link models: HS100, HS105, HS107, HS110, HS200, HS210, HS220, HS300.
 *
 * Models with multiple outlets (HS107, HS300) will have a children property.
 * If Plug is instantiated with a childId it will control the outlet associated with that childId.
 * Some functions only apply to the entire device, and are noted below.
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
   * See [Device constructor]{@link Device} for common options.
   * @param  {Object}  options
   * @param  {number} [options.inUseThreshold=0.1] Watts
   * @param  {string} [options.childId] If passed an integer or string between 0 and 99 it will prepend the deviceId
   */
  constructor (options) {
    super(options);

    this.log.debug('plug.constructor()');

    this.apiModuleNamespace = {
      'system': 'system',
      'cloud': 'cnCloud',
      'schedule': 'schedule',
      'timesetting': 'time',
      'emeter': 'emeter',
      'netif': 'netif'
    };

    this.inUseThreshold = options.inUseThreshold || 0.1;

    if (options.sysInfo) { this.sysInfo = options.sysInfo; }

    this.childId = options.childId || null;

    this.emitEventsEnabled = true;

    /**
     * @borrows Away#getRules as Plug.away#getRules
     * @borrows Away#addRule as Plug.away#addRule
     * @borrows Away#editRule as Plug.away#editRule
     * @borrows Away#deleteAllRules as Plug.away#deleteAllRules
     * @borrows Away#deleteRule as Plug.away#deleteRule
     * @borrows Away#setOverallEnable as Plug.away#setOverallEnable
     */
    this.away = new Away(this, 'anti_theft', this.childId);
    /**
     * @borrows Cloud#getInfo as Plug.cloud#getInfo
     * @borrows Cloud#bind as Plug.cloud#bind
     * @borrows Cloud#unbind as Plug.cloud#unbind
     * @borrows Cloud#getFirmwareList as Plug.cloud#getFirmwareList
     * @borrows Cloud#setServerUrl as Plug.cloud#setServerUrl
     */
    this.cloud = new Cloud(this, 'cnCloud');
    /**
     * @borrows Dimmer#setBrightness as Plug.dimmer#setBrightness
     * @borrows Dimmer#getDefaultBehavior as Plug.dimmer#getDefaultBehavior
     * @borrows Dimmer#getDimmerParameters as Plug.dimmer#getDimmerParameters
     * @borrows Dimmer#setDimmerTransition as Plug.dimmer#setDimmerTransition
     * @borrows Dimmer#setDoubleClickAction as Plug.dimmer#setDoubleClickAction
     * @borrows Dimmer#setFadeOffTime as Plug.dimmer#setFadeOffTime
     * @borrows Dimmer#setFadeOnTime as Plug.dimmer#setFadeOnTime
     * @borrows Dimmer#setGentleOffTime as Plug.dimmer#setGentleOffTime
     * @borrows Dimmer#setGentleOnTime as Plug.dimmer#setGentleOnTime
     * @borrows Dimmer#setLongPressAction as Plug.dimmer#setLongPressAction
     * @borrows Dimmer#setSwitchState as Plug.dimmer#setSwitchState
     */
    this.dimmer = new Dimmer(this, 'smartlife.iot.dimmer');
    /**
     * @borrows Emeter#realtime as Plug.emeter#realtime
     * @borrows Emeter#getRealtime as Plug.emeter#getRealtime
     * @borrows Emeter#getDayStats as Plug.emeter#getDayStats
     * @borrows Emeter#getMonthStats as Plug.emeter#getMonthStats
     * @borrows Emeter#eraseStats as Plug.emeter#eraseStats
     */
    this.emeter = new Emeter(this, 'emeter', this.childId);
    /**
     * @borrows Schedule#getNextAction as Plug.schedule#getNextAction
     * @borrows Schedule#getRules as Plug.schedule#getRules
     * @borrows Schedule#getRule as Plug.schedule#getRule
     * @borrows PlugSchedule#addRule as Plug.schedule#addRule
     * @borrows PlugSchedule#editRule as Plug.schedule#editRule
     * @borrows Schedule#deleteAllRules as Plug.schedule#deleteAllRules
     * @borrows Schedule#deleteRule as Plug.schedule#deleteRule
     * @borrows Schedule#setOverallEnable as Plug.schedule#setOverallEnable
     * @borrows Schedule#getDayStats as Plug.schedule#getDayStats
     * @borrows Schedule#getMonthStats as Plug.schedule#getMonthStats
     * @borrows Schedule#eraseStats as Plug.schedule#eraseStats
     */
    this.schedule = new Schedule(this, 'schedule', this.childId);
    /**
     * @borrows Time#getTime as Plug.time#getTime
     * @borrows Time#getTimezone as Plug.time#getTimezone
     */
    this.time = new Time(this, 'time');
    /**
     * @borrows Timer#getRules as Plug.timer#getRules
     * @borrows Timer#addRule as Plug.timer#addRule
     * @borrows Timer#editRule as Plug.timer#editRule
     * @borrows Timer#deleteAllRules as Plug.timer#deleteAllRules
     */
    this.timer = new Timer(this, 'count_down', this.childId);

    if (this.sysInfo) {
      this.lastState.inUse = this.inUse;
      this.lastState.relayState = this.relayState;
    }
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
    this.children = (sysInfo.children ? sysInfo.children : null);
    this.log.debug('[%s] plug sysInfo set', this.alias);
    this.emitEvents();
  }
  /**
   * Returns children as a map keyed by childId. From cached results from last retrieval of `system.sys_info.children`.
   * @return {Map} children
   */
  get children () {
    return this._children;
  }
  /**
   * @private
   */
  set children (children) {
    if (Array.isArray(children)) {
      this._children = new Map(children.map((child) => {
        child.id = this.normalizeChildId(child.id);
        return [ child.id, child ];
      }));
    } else if (children instanceof Map) {
      this._children = children;
    }
    if (this._childId && this._children) {
      this.childId = this._childId;
      // this._child = this._children.get(this.normalizeChildId(this._childId));
    }
  }
  /**
   * Returns childId.
   * @return {string} childId
   */
  get childId () {
    return this._childId;
  }
  /**
   * @private
   */
  set childId (childId) {
    this._childId = this.normalizeChildId(childId);
    if (this._childId && this._children) {
      this._child = this._children.get(this._childId);
    }
    if (this._childId && this._child == null) {
      throw new Error('Could not find child with childId ' + childId);
    }
  }
  /**
   * Cached value of `sys_info.alias` or `sys_info.children[childId].alias` if childId set.
   * @return {string}
   */
  get alias () {
    if (this.childId) {
      return this._child.alias;
    }
    return this.sysInfo.alias;
  }
  /**
   * @private
   */
  set alias (alias) {
    if (this.childId) {
      this._child.alias = alias;
    }
    this.sysInfo.alias = alias;
  }
  /**
   * Cached value of `sys_info.deviceId` or `childId` if set.
   * @return {string}
   */
  get id () {
    if (this.childId) {
      return this.childId;
    }
    return this.sysInfo.deviceId;
  }
  /**
   * Determines if device is in use based on cached `emeter.get_realtime` results.
   *
   * If device supports energy monitoring (e.g. HS110): `power > inUseThreshold`. `inUseThreshold` is specified in Watts
   *
   * Otherwise fallback on relay state: `relay_state === 1` or `sys_info.children[childId].state === 1`.
   *
   * Supports childId.
   * @return {boolean}
   */
  get inUse () {
    if (this.supportsEmeter) {
      return (this.emeter.realtime.power > this.inUseThreshold);
    }
    return this.relayState;
  }
  /**
   * Cached value of `sys_info.relay_state === 1` or `sys_info.children[childId].state === 1`. Supports childId.
   * @return {boolean} On (true) or Off (false)
   */
  get relayState () {
    if (this.childId) {
      return (this._child.state === 1);
    }
    return (this.sysInfo.relay_state === 1);
  }
  /**
   * @private
   */
  set relayState (relayState) {
    if (this.childId) {
      this._child.state = (relayState ? 1 : 0);
      return;
    }
    this.sysInfo.relay_state = (relayState ? 1 : 0);
  }
  /**
   * Cached value of `sys_info.brightness != null`
   * @return {boolean}
   */
  get supportsDimmer () {
    return (this.sysInfo.brightness != null);
  }
  /**
   * Requests common Plug status details in a single request.
   * - `system.get_sysinfo`
   * - `cloud.get_sysinfo`
   * - `emeter.get_realtime`
   * - `schedule.get_next_action`
   *
   * Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async getInfo (sendOptions) {
    // TODO force TCP unless overriden here
    let data;
    try {
      data = await this.sendCommand('{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}', this.childId, sendOptions);
    } catch (err) {
      // Ignore emeter section errors as not all devices support it
      if (err instanceof ResponseError && err.errorModules.length === 1 && err.errorModules[0] === 'emeter') {
        data = err.response;
      } else {
        throw err;
      }
    }
    this.sysInfo = data.system.get_sysinfo;
    this.cloud.info = data.cnCloud.get_info;
    if (data.emeter.hasOwnProperty('get_realtime')) {
      this.emeter.realtime = data.emeter.get_realtime;
    }
    this.schedule.nextAction = data.schedule.get_next_action;
    return {
      sysInfo: this.sysInfo,
      cloud: { info: this.cloud.info },
      emeter: { realtime: this.emeter.realtime },
      schedule: { nextAction: this.schedule.nextAction }
    };
  }
  /**
   * Same as {@link #inUse}, but requests current `emeter.get_realtime`. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async getInUse (sendOptions) {
    if (this.supportsEmeter) {
      await this.emeter.getRealtime(sendOptions);
    } else {
      await this.getSysInfo(sendOptions);
    }
    return this.inUse;
  }
  /**
   * Get Plug LED state (night mode).
   *
   * Requests `system.sys_info` and returns true if `led_off === 0`. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>} LED State, true === on
   */
  async getLedState (sendOptions) {
    const sysInfo = await this.getSysInfo(sendOptions);
    return (sysInfo.led_off === 0);
  }
  /**
   * Turn Plug LED on/off (night mode). Does not support childId.
   *
   * Sends `system.set_led_off` command.
   * @param  {boolean}      value LED State, true === on
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setLedState (value, sendOptions) {
    await this.sendCommand(`{"system":{"set_led_off":{"off":${(value ? 0 : 1)}}}}`, null, sendOptions);
    this.sysInfo.set_led_off = (value ? 0 : 1);
    return true;
  }
  /**
   * Get Plug relay state (on/off).
   *
   * Requests `system.get_sysinfo` and returns true if On. Calls {@link #relayState}. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async getPowerState (sendOptions) {
    await this.getSysInfo(sendOptions);
    return this.relayState;
  }
  /**
   * Turns Plug relay on/off.
   *
   * Sends `system.set_relay_state` command. Supports childId.
   * @param  {boolean}      value
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setPowerState (value, sendOptions) {
    await this.sendCommand(`{"system":{"set_relay_state":{"state":${(value ? 1 : 0)}}}}`, this.childId, sendOptions);
    this.relayState = value;
    this.emitEvents();
    return true;
  }
  /**
   * Toggles Plug relay state.
   *
   * Requests `system.get_sysinfo` sets the power state to the opposite `relay_state === 1 and returns the new power state`. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async togglePowerState (sendOptions) {
    const powerState = await this.getPowerState(sendOptions);
    await this.setPowerState(!powerState, sendOptions);
    return !powerState;
  }
  /**
   * Blink Plug LED.
   *
   * Sends `system.set_led_off` command alternating on and off number of `times` at `rate`,
   * then sets the led to its pre-blink state. Does not support childId.
   *
   * Note: `system.set_led_off` is particulally slow, so blink rate is not guaranteed.
   * @param  {number}      [times=5]
   * @param  {number}      [rate=1000]
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async blink (times = 5, rate = 1000, sendOptions) {
    const delay = (t) => { return new Promise((resolve) => { setTimeout(resolve, t); }); };

    const origLedState = await this.getLedState(sendOptions);
    let lastBlink = Date.now();

    let currLedState = false;
    for (var i = 0; i < times * 2; i++) {
      currLedState = !currLedState;
      lastBlink = Date.now();
      await this.setLedState(currLedState, sendOptions);
      const timeToWait = (rate / 2) - (Date.now() - lastBlink);
      if (timeToWait > 0) {
        await delay(timeToWait);
      }
    }
    if (currLedState !== origLedState) {
      await this.setLedState(origLedState, sendOptions);
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
    const relayState = this.relayState;

    this.log.debug('[%s] plug.emitEvents() inUse: %s relayState: %s lastState: %j', this.alias, inUse, relayState, this.lastState);
    if (this.lastState.inUse !== inUse) {
      this.lastState.inUse = inUse;
      if (inUse) {
        this.emit('in-use');
      } else {
        this.emit('not-in-use');
      }
    }
    this.emit('in-use-update', inUse);

    if (this.lastState.relayState !== relayState) {
      this.lastState.relayState = relayState;
      if (relayState) {
        this.emit('power-on');
      } else {
        this.emit('power-off');
      }
    }
    this.emit('power-update', relayState);
  }
}

module.exports = Plug;
