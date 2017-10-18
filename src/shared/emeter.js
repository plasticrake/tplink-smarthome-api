'use strict';

/**
 * Eemter
 */
class Emeter {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;

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
    this._realtime = realtime;
    this.device.emit('emeter-realtime-update', this._realtime);
  }
  /**
   * Gets device's current energy stats.
   *
   * Requests `emeter.get_realtime`.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getRealtime (sendOptions) {
    this.realtime = await this.device.sendCommand({
      [this.apiModuleName]: {get_realtime: {}}
    }, sendOptions);
    return this.realtime;
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
  async getDayStats (year, month, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_daystat: { year, month } }
    }, sendOptions);
  }
  /**
   * Get Monthly Emeter Statisics.
   *
   * Sends `emeter.get_monthstat` command.
   * @param  {number}       year
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getMonthStats (year, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_monthstat: { year } }
    }, sendOptions);
  }
  /**
   * Erase Emeter Statistics.
   *
   * Sends `emeter.erase_runtime_stat` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async eraseStats (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { erase_emeter_stat: {} }
    }, sendOptions);
  }
}

module.exports = Emeter;
