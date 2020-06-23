import Schedule, { createScheduleRule } from '../shared/schedule';
import type { ScheduleRule, ScheduleRuleInputTime } from '../shared/schedule';
import type { SendOptions } from '../client';
import { isDefinedAndNotNull } from '../utils';

type PlugScheduleRule = Omit<ScheduleRule, 'emin'> & {
  sact?: number;
  s_dimmer?: {};
  emin: 0;
};

export type PlugScheduleRuleInput = {
  powerState: boolean;
  dimmer?: {};
  start: ScheduleRuleInputTime;
  daysOfWeek?: number[];
  name?: string;
  enable: boolean;
};

export default class PlugSchedule extends Schedule {
  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id. Supports childId.
   * @param  {Object}        options
   * @param  {boolean}      [options.powerState]
   * @param  {Object}       [options.dimmer] dimmer data (dimmable plugs only)
   * @param  {(Date|number)} options.start  Date or number of minutes
   * @param  {number[]}     [options.daysOfWeek]  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {string}       [options.name]
   * @param  {boolean}      [options.enable=true]
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async addRule(
    {
      powerState,
      dimmer,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    }: PlugScheduleRuleInput,
    sendOptions?: SendOptions
  ): ReturnType<Schedule['addRule']> {
    const rule: PlugScheduleRule = {
      sact: powerState ? 1 : 0,
      name,
      enable: enable ? 1 : 0,
      emin: 0,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    if (isDefinedAndNotNull(dimmer)) {
      rule.sact = 3;
      rule.s_dimmer = dimmer;
    }

    return Schedule.prototype.addRule.call(this, rule, sendOptions); // super.addRule(rule); // workaround babel bug
  }

  /**
   * Edits Schedule rule.
   *
   * Sends `schedule.edit_rule` command and returns rule id. Supports childId.
   * @param  {Object}        options
   * @param  {string}        options.id
   * @param  {boolean}      [options.powerState]
   * @param  {Object}       [options.dimmer] dimmer data (dimmable plugs only)
   * @param  {(Date|number)} options.start  Date or number of minutes
   * @param  {number[]}     [options.daysOfWeek]  [0,6] = weekend, [1,2,3,4,5] = weekdays
   * @param  {string}       [options.name]    [description]
   * @param  {boolean}      [options.enable=true]
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async editRule(
    {
      id,
      powerState,
      dimmer,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    }: PlugScheduleRuleInput & { id: string },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    const rule: PlugScheduleRule & { id: string } = {
      id,
      sact: powerState ? 1 : 0,
      name,
      enable: enable ? 1 : 0,
      emin: 0,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    if (isDefinedAndNotNull(dimmer)) {
      rule.sact = 3;
      rule.s_dimmer = dimmer;
    }

    return Schedule.prototype.editRule.call(this, rule, sendOptions); // super.editRule(rule); // workaround babel bug
  }
}
