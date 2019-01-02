'use strict';

/**
 * Time
 */
class Time {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Gets device's time.
   *
   * Requests `timesetting.get_time`. Does not support ChildId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getTime (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_time: {} }
    }, null, sendOptions);
  }
  /**
   * Gets device's timezone.
   *
   * Requests `timesetting.get_timezone`. Does not support ChildId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getTimezone (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_timezone: {} }
    }, null, sendOptions);
  }
}

module.exports = Time;
