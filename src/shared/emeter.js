'use strict';

/**
 * Eemter
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Emeter {
  constructor(device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;

    this._realtime = {};
  }
  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @return {Object}
   */
  get realtime() {
    return this._realtime;
  }
  /**
   * @private
   */
  set realtime(realtime) {
    let normalize = function normalize(propName, propName2, multiplier) {
      if (null == realtime) {
        return null;
      }
      if (realtime[propName] != null && realtime[propName2] == null) {
        realtime[propName2] = Math.floor(realtime[propName] * multiplier);
      } else if (realtime[propName] == null && realtime[propName2] != null) {
        realtime[propName] = realtime[propName2] / multiplier;
      }
    };

    normalize('current', 'current_ma', 1000);
    normalize('power', 'power_mw', 1000);
    normalize('total', 'total_wh', 1000);
    normalize('voltage', 'voltage_mv', 1000);

    this._realtime = realtime;
    this.device.emit('emeter-realtime-update', this._realtime);
  }
  /**
   * Gets device's current energy stats.
   *
   * Requests `emeter.get_realtime`. Older devices return `current`, `voltage`,... while newer devices return `current_ma`, `voltage_mv`...
   * This will return a normalized response including both old and new style properies for backwards compatibility.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  getRealtime(sendOptions) {
    var _this = this;

    return _asyncToGenerator(function* () {
      _this.realtime = yield _this.device.sendCommand({
        [_this.apiModuleName]: { get_realtime: {} }
      }, sendOptions);
      return _this.realtime;
    })();
  }
  /**
   * Get Daily Emeter Statisics.
   *
   * Sends `emeter.get_daystat` command.
   * @param  {number}       year
   * @param  {number}       month
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  getDayStats(year, month, sendOptions) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return _this2.device.sendCommand({
        [_this2.apiModuleName]: { get_daystat: { year, month } }
      }, sendOptions);
    })();
  }
  /**
   * Get Monthly Emeter Statisics.
   *
   * Sends `emeter.get_monthstat` command.
   * @param  {number}       year
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  getMonthStats(year, sendOptions) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      return _this3.device.sendCommand({
        [_this3.apiModuleName]: { get_monthstat: { year } }
      }, sendOptions);
    })();
  }
  /**
   * Erase Emeter Statistics.
   *
   * Sends `emeter.erase_runtime_stat` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  eraseStats(sendOptions) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      return _this4.device.sendCommand({
        [_this4.apiModuleName]: { erase_emeter_stat: {} }
      }, sendOptions);
    })();
  }
}

module.exports = Emeter;