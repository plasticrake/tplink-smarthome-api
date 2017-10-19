'use strict';

const { createScheduleRule } = require('../utils');

/**
 * Away
 */
class Away {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Gets Away Rules.
   *
   * Requests `anti_theft.get_rules`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: {get_rules: {}}
    }, sendOptions);
  }
  /**
   * Gets Away Rule.
   *
   * Requests `anti_theft.get_rules` and return rule matching Id
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response of rule
   */
  async getRule (id, sendOptions) {
    let rules = await this.getRules(sendOptions);
    let rule = rules.rule_list.find((r) => r.id === id);
    if (rule) {
      rule.err_code = rules.err_code;
    }
    return rule;
  }
  /**
   * Adds Away Rule.
   *
   * Sends `anti_theft.add_rule` command and returns rule id.
   * @param  {Object}        options
   * @param  {(Date|number)} options.start   Date or number of minutes
   * @param  {(Date|number)} options.end     Date or number of minutes (only time component of date is used)
   * @param  {number[]}      options.daysOfWeek  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {number}       [options.frequency=5]
   * @param  {string}       [options.name]
   * @param  {boolean}      [options.enable=true]
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async addRule ({ start, end, daysOfWeek, frequency = 5, name = '', enable = true }, sendOptions) {
    const rule = Object.assign({
      frequency,
      name,
      enable: (enable ? 1 : 0)
    }, createScheduleRule({ start, end, daysOfWeek }));
    return this.device.sendCommand({
      [this.apiModuleName]: { add_rule: rule }
    }, sendOptions);
  }
  /**
   * Edits Away rule.
   *
   * Sends `anti_theft.edit_rule` command and returns rule id.
   * @param  {Object}        options
   * @param  {string}        options.id
   * @param  {(Date|number)} options.start   Date or number of minutes
   * @param  {(Date|number)} options.end     Date or number of minutes (only time component of date is used)
   * @param  {number[]}      options.daysOfWeek  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {number}       [options.frequency=5]
   * @param  {string}       [options.name]
   * @param  {boolean}      [options.enable=true]
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async editRule ({ id, start, end, daysOfWeek, frequency = 5, name = '', enable = true }, sendOptions) {
    const rule = Object.assign({
      id,
      frequency,
      name,
      enable: (enable ? 1 : 0)
    }, createScheduleRule({ start, end, daysOfWeek }));
    return this.device.sendCommand({
      [this.apiModuleName]: { edit_rule: rule }
    }, sendOptions);
  }
  /**
   * Deletes All Away Rules.
   *
   * Sends `anti_theft.delete_all_rules` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async deleteAllRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { delete_all_rules: {} }
    }, sendOptions);
  }
  /**
   * Deletes Away Rule.
   *
   * Sends `anti_theft.delete_rule` command.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async deleteRule (id, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { delete_rule: { id } }
    }, sendOptions);
  }
  /**
   * Enables or Disables Away Rules.
   *
   * Sends `anti_theft.set_overall_enable` command.
   * @param  {boolean}      enable
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setOverallEnable (enable, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { set_overall_enable: { enable: (enable ? 1 : 0) } }
    }, sendOptions);
  }
}

module.exports = Away;
