/* eslint camelcase: ["off"] */
'use strict';

/**
 * Schedule
 */
class Schedule {
  constructor (device, apiModuleName, childId = null) {
    this.device = device;
    this.apiModuleName = apiModuleName;
    this.childId = childId;
  }
  /**
   * Gets Next Schedule Rule Action.
   *
   * Requests `schedule.get_next_action`. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getNextAction (sendOptions) {
    this.nextaction = this.device.sendCommand({
      [this.apiModuleName]: { get_next_action: {} }
    }, this.childId, sendOptions);
    return this.nextaction;
  }
  /**
   * Gets Schedule Rules.
   *
   * Requests `schedule.get_rules`. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_rules: {} }
    }, this.childId, sendOptions);
  }
  /**
   * Gets Schedule Rule.
   *
   * Requests `schedule.get_rules` and return rule matching Id. Supports childId.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response of rule
   */
  async getRule (id, sendOptions) {
    const rules = await this.getRules(sendOptions);
    const rule = rules.rule_list.find((r) => r.id === id);
    if (rule) {
      rule.err_code = rules.err_code;
    }
    return rule;
  }
  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id. Supports childId.
   * @param  {Object}       rule
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async addRule (rule, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { add_rule: rule }
    }, this.childId, sendOptions);
  }
  /**
   * Edits Schedule Rule.
   *
   * Sends `schedule.edit_rule` command. Supports childId.
   * @param  {Object}       rule
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async editRule (rule, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { edit_rule: rule }
    }, this.childId, sendOptions);
  }
  /**
   * Deletes All Schedule Rules.
   *
   * Sends `schedule.delete_all_rules` command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async deleteAllRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { delete_all_rules: {} }
    }, this.childId, sendOptions);
  }
  /**
   * Deletes Schedule Rule.
   *
   * Sends `schedule.delete_rule` command. Supports childId.
   * @param  {string}       id
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async deleteRule (id, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { delete_rule: { id } }
    }, this.childId, sendOptions);
  }
  /**
   * Enables or Disables Schedule Rules.
   *
   * Sends `schedule.set_overall_enable` command. Supports childId.
   * @param  {boolean}     enable
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setOverallEnable (enable, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { set_overall_enable: { enable: (enable ? 1 : 0) } }
    }, this.childId, sendOptions);
  }
  /**
   * Get Daily Usage Statisics.
   *
   * Sends `schedule.get_daystat` command. Supports childId.
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
   * Get Monthly Usage Statisics.
   *
   * Sends `schedule.get_monthstat` command. Supports childId.
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
   * Erase Usage Statistics.
   *
   * Sends `schedule.erase_runtime_stat` command. Supports childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async eraseStats (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { erase_runtime_stat: { } }
    }, this.childId, sendOptions);
  }
}

module.exports = Schedule;
