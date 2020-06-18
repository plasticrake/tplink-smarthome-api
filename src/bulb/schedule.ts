/* eslint camelcase: ["off"] */

import Schedule, { createScheduleRule, ScheduleRule } from '../shared/schedule';
import type { ScheduleRuleInputTime } from '../shared/schedule';
import type { LightState } from './lighting';
import type { SendOptions } from '../client';

type BulbScheduleRule = Omit<ScheduleRule, 'emin'> & {
  s_light: LightState;
  sact: 2;
  emin: -1;
  etime_opt: -1;
};

export type BulbScheduleRuleInput = {
  lightState: LightState;
  start: ScheduleRuleInputTime;
  daysOfWeek?: number[];
  name: string;
  enable: boolean;
};

export default class BulbSchedule extends Schedule {
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
  async addRule(
    {
      lightState,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    }: BulbScheduleRuleInput,
    sendOptions?: SendOptions
  ): Promise<{ id: string }> {
    const rule: BulbScheduleRule = {
      s_light: lightState,
      name,
      enable: enable ? 1 : 0,
      sact: 2,
      emin: -1,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

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
  async editRule(
    {
      id,
      lightState,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    }: BulbScheduleRuleInput & { id: string },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    const rule = {
      id,
      s_light: lightState,
      name,
      enable: enable ? 1 : 0,
      sact: 2,
      emin: -1,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    return Schedule.prototype.editRule.call(this, rule, sendOptions); // super.addRule(rule); // workaround babel bug
  }
}
