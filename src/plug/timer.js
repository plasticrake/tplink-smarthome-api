'use strict';

/**
 * Timer
 */
class Timer {
  constructor (device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
  }
  /**
   * Get Countdown Timer Rule (only one allowed).
   *
   * Requests `count_down.get_rules`. Supports childId.
   * @param  {string[]|string|number[]|number} [childIds] for multi-outlet devices, which outlet(s) to target
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_rules: {} }
    }, this.childId, sendOptions);
  }
  /**
   * Add Countdown Timer Rule (only one allowed).
   *
   * Sends count_down.add_rule command. Supports childId.
   * @param  {Object}       options
   * @param  {number}       options.delay                delay in seconds
   * @param  {boolean}      options.powerState           turn on or off device
   * @param  {string}      [options.name='timer']        rule name
   * @param  {boolean}     [options.enable=true]         rule enabled
   * @param  {boolean}     [options.deleteExisting=true] send `delete_all_rules` command before adding
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async addRule ({ delay, powerState, name = 'timer', enable = true, deleteExisting = true }, sendOptions) {
    if (deleteExisting) await this.deleteAllRules(sendOptions);
    return this.device.sendCommand({
      [this.apiModuleName]: {
        add_rule: {
          enable: (enable ? 1 : 0),
          delay,
          act: (powerState ? 1 : 0),
          name
        }
      }
    }, this.childId, sendOptions);
  }
  /**
   * Edit Countdown Timer Rule (only one allowed).
   *
   * Sends count_down.edit_rule command. Supports childId.
   * @param  {Object}       options
   * @param  {string}       options.id               rule id
   * @param  {number}       options.delay            delay in seconds
   * @param  {number}       options.powerState       turn on or off device
   * @param  {string}      [options.name='timer']    rule name
   * @param  {Boolean}     [options.enable=true]     rule enabled
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async editRule ({ id, delay, powerState, name = 'timer', enable = true }, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        edit_rule: {
          id,
          enable: (enable ? 1 : 0),
          delay,
          act: (powerState ? 1 : 0),
          name
        }
      }
    }, this.childId, sendOptions);
  }
  /**
   * Delete Countdown Timer Rule (only one allowed).
   *
   * Sends count_down.delete_all_rules command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async deleteAllRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { delete_all_rules: {} }
    }, this.childId, sendOptions);
  }
}

module.exports = Timer;
