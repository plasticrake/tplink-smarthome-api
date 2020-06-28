/* eslint camelcase: ["off"] */

import type Bulb from '.';
import Schedule, { createScheduleRule, ScheduleRule } from '../shared/schedule';
import type { ScheduleRuleInputTime } from '../shared/schedule';
import type { LightState } from './lighting';
import type { SendOptions } from '../client';

export type BulbScheduleRule = Omit<ScheduleRule, 'emin'> & {
  s_light: LightState;
  sact: 2;
  emin: -1;
  etime_opt: -1;
};

export interface BulbScheduleRuleInput {
  lightState: LightState;
  /**
   * Date or number of minutes
   */
  start: ScheduleRuleInputTime;
  /**
   * [0,6] = weekend, [1,2,3,4,5] = weekdays
   */
  daysOfWeek?: number[];
  /**
   * @defaultValue ''
   */
  name: string;
  /**
   * @defaultValue true
   */
  enable: boolean;
}

export default class BulbSchedule extends Schedule {
  constructor(
    readonly device: Bulb,
    readonly apiModuleName: string,
    readonly childId?: string
  ) {
    super(device, apiModuleName, childId);
  }

  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async addRule(
    rule: BulbScheduleRuleInput,
    sendOptions?: SendOptions
  ): Promise<{ id: string }> {
    const { lightState, start, daysOfWeek, name = '', enable = true } = rule;

    const scheduleRule: BulbScheduleRule = {
      s_light: lightState,
      name,
      enable: enable ? 1 : 0,
      sact: 2,
      emin: -1,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    return super.addRule(scheduleRule, sendOptions);
  }

  /**
   * Edits Schedule rule.
   *
   * Sends `schedule.edit_rule`.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async editRule(
    rule: BulbScheduleRuleInput & { id: string },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    const {
      id,
      lightState,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    } = rule;

    const scheduleRule = {
      id,
      s_light: lightState,
      name,
      enable: enable ? 1 : 0,
      sact: 2,
      emin: -1,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    return super.editRule(scheduleRule, sendOptions);
  }
}
