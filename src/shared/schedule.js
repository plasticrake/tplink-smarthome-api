/* eslint camelcase: ["off"] */
'use strict';

/**
 * Schedule
 */
class Schedule {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Gets Next Schedule Rule Action.
   *
   * Requests `schedule.get_next_action`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getNextAction (sendOptions) {
    this.nextaction = this.device.sendCommand({
      [this.apiModuleName]: { get_next_action: {} }
    }, sendOptions);
    return this.nextaction;
  }
  /**
   * Gets Schedule Rules.
   *
   * Requests `schedule.get_rules`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_rules: {} }
    }, sendOptions);
  }
  /**
   * Gets Schedule Rule.
   *
   * Requests `schedule.get_rules` and return rule matching Id
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
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id.
   * @param  {Object}       rule
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async addRule (rule, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { add_rule: rule }
    }, sendOptions);
  }
  /**
   * Edits Schedule Rule.
   *
   * Sends `schedule.edit_rule` command.
   * @param  {Object}       rule
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async editRule (rule, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { edit_rule: rule }
    }, sendOptions);
  }
  /**
   * Deletes All Schedule Rules.
   *
   * Sends `schedule.delete_all_rules` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async deleteAllRules (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { delete_all_rules: {} }
    }, sendOptions);
  }
  /**
   * Deletes Schedule Rule.
   *
   * Sends `schedule.delete_rule` command.
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
   * Enables or Disables Schedule Rules.
   *
   * Sends `schedule.set_overall_enable` command.
   * @param  {boolean}     enable
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setOverallEnable (enable, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { set_overall_enable: { enable: (enable ? 1 : 0) } }
    }, sendOptions);
  }
  /**
   * Get Daily Usage Statisics.
   *
   * Sends `schedule.get_daystat` command.
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
   * Get Monthly Usage Statisics.
   *
   * Sends `schedule.get_monthstat` command.
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
   * Erase Usage Statistics.
   *
   * Sends `schedule.erase_runtime_stat` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async eraseStats (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { erase_runtime_stat: { } }
    }, sendOptions);
  }
}

module.exports = Schedule;
