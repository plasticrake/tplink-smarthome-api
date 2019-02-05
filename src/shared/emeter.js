'use strict';

/**
 * Eemter
 */
class Emeter {
  constructor (device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
    this._realtime = {};
  }
  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @return {Object}
   */
  get realtime () {
    return this._realtime;
  }
  /**
   * @private
   */
  set realtime (realtime) {
    const normalizedRealtime = Object.assign({}, realtime); // will coerce null/undefined to {}

    const normalize = function (propName, propName2, multiplier) {
      if (normalizedRealtime[propName] != null && normalizedRealtime[propName2] == null) {
        normalizedRealtime[propName2] = Math.floor(normalizedRealtime[propName] * multiplier);
      } else if (normalizedRealtime[propName] == null && normalizedRealtime[propName2] != null) {
        normalizedRealtime[propName] = normalizedRealtime[propName2] / multiplier;
      }
    };

    if (realtime != null) {
      normalize('current', 'current_ma', 1000);
      normalize('power', 'power_mw', 1000);
      normalize('total', 'total_wh', 1000);
      normalize('voltage', 'voltage_mv', 1000);
    }

    this._realtime = normalizedRealtime;
    this.device.emit('emeter-realtime-update', this._realtime);
  }
  /**
   * Gets device's current energy stats.
   *
   * Requests `emeter.get_realtime`. Older devices return `current`, `voltage`, etc,
   * while newer devices return `current_ma`, `voltage_mv` etc
   * This will return a normalized response including both old and new style properies for backwards compatibility.
   * Supports childId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getRealtime (sendOptions) {
    this.realtime = await this.device.sendCommand({
      [this.apiModuleName]: { get_realtime: {} }
    }, this.childId, sendOptions);
    return this.realtime;
  }
  /**
   * Get Daily Emeter Statisics.
   *
   * Sends `emeter.get_daystat` command. Supports childId.
   * @param  {number}       year
   * @param  {number}       month
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getDayStats (year, month, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_daystat: { year, month } }
    }, this.childId, sendOptions);
  }
  /**
   * Get Monthly Emeter Statisics.
   *
   * Sends `emeter.get_monthstat` command. Supports childId.
   * @param  {number}       year
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getMonthStats (year, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_monthstat: { year } }
    }, this.childId, sendOptions);
  }
  /**
   * Erase Emeter Statistics.
   *
   * Sends `emeter.erase_runtime_stat` command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async eraseStats (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { erase_emeter_stat: {} }
    }, this.childId, sendOptions);
  }
}

module.exports = Emeter;
