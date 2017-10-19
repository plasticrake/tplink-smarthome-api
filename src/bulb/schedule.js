/* eslint camelcase: ["off"] */
'use strict';

const Schedule = require('../shared/schedule');
const { createScheduleRule } = require('../utils');

/**
 * BulbSchedule
 */
class BulbSchedule extends Schedule {
  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id.
   * @param  {Object}         options
   * @param  {Object}         options.lightState
   * @param  {(Date|number)}  options.start  Date or number of minutes
   * @param  {number[]}      [options.daysOfWeek]  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {string}        [options.name]
   * @param  {boolean}       [options.enable=true]
   * @param  {SendOptions}   [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async addRule ({ lightState, start, daysOfWeek, name = '', enable = true }, sendOptions) {
    const rule = Object.assign({
      s_light: lightState,
      name,
      enable: (enable ? 1 : 0),
      sact: 2,
      emin: -1,
      etime_opt: -1
    }, createScheduleRule({ start, daysOfWeek }));

    return Schedule.prototype.addRule.call(this, rule, sendOptions); // super.addRule(rule); // workaround babel bug
  }
  /**
   * Edits Schedule rule.
   *
   * Sends `schedule.edit_rule` command and returns rule id.
   * @param  {string}         options.id
   * @param  {Object}         options.lightState
   * @param  {(Date|number)}  options.start  Date or number of minutes
   * @param  {number[]}      [options.daysOfWeek]  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {string}        [options.name]    [description]
   * @param  {boolean}       [options.enable=true]
   * @param  {SendOptions}   [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async editRule ({ id, lightState, start, daysOfWeek, name = '', enable = true }, sendOptions) {
    const rule = Object.assign({
      id,
      s_light: lightState,
      name,
      enable: (enable ? 1 : 0),
      sact: 2,
      emin: -1,
      etime_opt: -1
    }, createScheduleRule({ start, daysOfWeek }));

    return Schedule.prototype.editRule.call(this, rule, sendOptions); // super.addRule(rule); // workaround babel bug
  }
}

module.exports = BulbSchedule;
