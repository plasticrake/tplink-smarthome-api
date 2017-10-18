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
}

module.exports = Emeter;
