'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Device = require('../device');
const Away = require('./away');
const Cloud = require('../shared/cloud');
const Emeter = require('../shared/emeter');
const Schedule = require('./schedule');
const Timer = require('./timer');
const Time = require('../shared/time');

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
   * @param  {Object}  options
   * @param  {Number} [options.inUseThreshold=0]
   */
  constructor(options) {
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

    this.inUseThreshold = options.inUseThreshold || 0;

    this.emitEventsEnabled = true;

    /**
     * @borrows Away#getRules as Plug.away#getRules
     * @borrows Away#addRule as Plug.away#addRule
     * @borrows Away#editRule as Plug.away#editRule
     * @borrows Away#deleteAllRules as Plug.away#deleteAllRules
     * @borrows Away#deleteRule as Plug.away#deleteRule
     * @borrows Away#setOverallEnable as Plug.away#setOverallEnable
     */
    this.away = new Away(this, 'anti_theft');
    /**
     * @borrows Cloud#getInfo as Plug.cloud#getInfo
     * @borrows Cloud#bind as Plug.cloud#bind
     * @borrows Cloud#unbind as Plug.cloud#unbind
     * @borrows Cloud#getFirmwareList as Plug.cloud#getFirmwareList
     * @borrows Cloud#setServerUrl as Plug.cloud#setServerUrl
     */
    this.cloud = new Cloud(this, 'cnCloud');
    /**
     * @borrows Emeter#realtime as Plug.emeter#realtime
     * @borrows Emeter#getRealtime as Plug.emeter#getRealtime
     * @borrows Emeter#getDayStats as Plug.emeter#getDayStats
     * @borrows Emeter#getMonthStats as Plug.emeter#getMonthStats
     * @borrows Emeter#eraseStats as Plug.emeter#eraseStats
     */
    this.emeter = new Emeter(this, 'emeter');
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
    this.schedule = new Schedule(this, 'schedule');
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
    this.timer = new Timer(this, 'count_down');

    if (this.sysInfo) {
      this.lastState.inUse = this.inUse;
      this.lastState.relayState = this.relayState;
    }
  }
  /**
   * Returns cached results from last retrieval of `system.sys_info`.
   * @return {Object} system.sys_info
   */
  get sysInfo() {
    return super.sysInfo;
  }
  /**
   * @private
   */
  set sysInfo(sysInfo) {
    super.sysInfo = sysInfo;
    this.supportsEmeter = sysInfo.feature && typeof sysInfo.feature === 'string' ? sysInfo.feature.indexOf('ENE') >= 0 : false;
    this.log.debug('[%s] plug sysInfo set', this.alias);
    this.emitEvents();
  }
  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @return {Object}
   */
  // get emeterRealtime () {
  //   return super.emeterRealtime;
  // }
  // /**
  //  * @private
  //  */
  // set emeterRealtime (emeterRealtime) {
  //   this.log.debug('[%s] plug emeterRealtime set, supportsEmeter: %s', this.alias, this.supportsEmeter);
  //   if (this.supportsEmeter) {
  //     super.emeterRealtime = emeterRealtime;
  //     this.emitEvents();
  //   }
  // }
  /**
   * Determines if device is in use based on cached `emeter.get_realtime` results.
   *
   * If device supports energy monitoring (HS110): `power > inUseThreshold`
   *
   * Otherwise fallback on relay state:  `relay_state === 1`
   * @return {boolean}
   */
  get inUse() {
    if (this.supportsEmeter) {
      return this.emeter.realtime.power > this.inUseThreshold;
    }
    return this.relayState;
  }
  /**
   * `sys_info.relay_state === 1`
   * @return {boolean}
   */
  get relayState() {
    return this.sysInfo.relay_state === 1;
  }
  /**
   * Requests common Plug status details in a single request.
   * - `system.get_sysinfo`
   * - `cloud.get_sysinfo`
   * - `emeter.get_realtime`
   * - `schedule.get_next_action`
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  getInfo(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      // TODO force TCP unless overriden here
      // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
      let data = yield _this.send('{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}', sendOptions);
      _this.sysInfo = data.system.get_sysinfo;
      _this.cloud.info = data.cnCloud.get_info;
      if (data.emeter.hasOwnProperty('err_code')) {
        _this.emeter.realtime = null;
      } else {
        _this.emeter.realtime = data.emeter.get_realtime;
      }
      _this.schedule.nextAction = data.schedule.get_next_action;
      return {
        sysInfo: _this.sysInfo,
        cloud: { info: _this.cloud.info },
        emeter: { realtime: _this.emeter.realtime },
        schedule: { nextAction: _this.schedule.nextAction }
      };
    })();
  }

  /**
   * Same as {@link #inUse}, but requests current `emeter.get_realtime`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  getInUse(sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (_this2.supportsEmeter) {
        yield _this2.emeter.getRealtime(sendOptions);
      } else {
        yield _this2.getSysInfo(sendOptions);
      }
      return _this2.inUse;
    })();
  }
  /**
   * Get Plug LED state (night mode).
   *
   * Requests `system.sys_info` and returns true if `led_off === 0`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>} LED State, true === on
   */
  getLedState(sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let sysInfo = yield _this3.getSysInfo(sendOptions);
      return sysInfo.led_off === 0;
    })();
  }
  /**
   * Turn Plug LED on/off (night mode).
   *
   * Sends `system.set_led_off` command.
   * @param  {boolean}      value LED State, true === on
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  setLedState(value, sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      yield _this4.sendCommand(`{"system":{"set_led_off":{"off":${value ? 0 : 1}}}}`, sendOptions);
      _this4.sysInfo.set_led_off = value ? 0 : 1;
      return true;
    })();
  }
  /**
   * Get Plug relay state (on/off).
   *
   * Requests `system.get_sysinfo` and returns true if `relay_state === 1`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  getPowerState(sendOptions) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      let sysInfo = yield _this5.getSysInfo(sendOptions);
      return sysInfo.relay_state === 1;
    })();
  }
  /**
   * Turns Plug relay on/off.
   *
   * Sends `system.set_relay_state` command.
   * @param  {boolean}      value
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  setPowerState(value, sendOptions) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      yield _this6.sendCommand(`{"system":{"set_relay_state":{"state":${value ? 1 : 0}}}}`, sendOptions);
      _this6.sysInfo.relay_state = value ? 1 : 0;
      _this6.emitEvents();
      return true;
    })();
  }
  /**
   * Toggles Plug relay state.
   *
   * Requests `system.get_sysinfo` sets the power state to the opposite `relay_state === 1 and return the new power state`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  togglePowerState(sendOptions) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const powerState = yield _this7.getPowerState(sendOptions);
      yield _this7.setPowerState(!powerState, sendOptions);
      return !powerState;
    })();
  }
  /**
   * Blink Plug LED.
   *
   * Sends `system.set_led_off` command alternating on and off number of `times` at `rate`,
   * then sets the led to its pre-blink state.
   *
   * Note: `system.set_led_off` is particulally slow, so blink rate is not guaranteed.
   * @param  {number}      [times=5]
   * @param  {number}      [rate=1000]
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  blink(times = 5, rate = 1000, sendOptions) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      let delay = function delay(t) {
        return new Promise(function (resolve) {
          setTimeout(resolve, t);
        });
      };

      let origLedState = yield _this8.getLedState(sendOptions);
      let lastBlink = Date.now();

      let currLedState = false;
      for (var i = 0; i < times * 2; i++) {
        currLedState = !currLedState;
        lastBlink = Date.now();
        yield _this8.setLedState(currLedState, sendOptions);
        let timeToWait = rate / 2 - (Date.now() - lastBlink);
        if (timeToWait > 0) {
          yield delay(timeToWait);
        }
      }
      if (currLedState !== origLedState) {
        yield _this8.setLedState(origLedState, sendOptions);
      }
      return true;
    })();
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
  emitEvents() {
    if (!this.emitEventsEnabled) {
      return;
    }

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