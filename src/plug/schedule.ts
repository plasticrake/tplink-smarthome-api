import type Plug from '.';
import Schedule, { createScheduleRule } from '../shared/schedule';
import type { ScheduleRule, ScheduleRuleInputTime } from '../shared/schedule';
import type { SendOptions } from '../client';
import { isDefinedAndNotNull } from '../utils';

export type PlugScheduleRule = Omit<ScheduleRule, 'emin'> & {
  sact?: number;
  s_dimmer?: Record<string, unknown>;
  emin: 0;
};

export interface PlugScheduleRuleInput {
  powerState: boolean;
  /**
   * dimmer data (dimmable plugs only)
   */
  dimmer?: Record<string, unknown>;
  /**
   * Date or number of minutes
   */
  start: ScheduleRuleInputTime;
  /**
   * [0,6] = weekend, [1,2,3,4,5] = weekdays
   */
  daysOfWeek?: number[];
  name?: string;
  /**
   * @defaultValue true
   */
  enable: boolean;
}

export default class PlugSchedule extends Schedule {
  constructor(
    readonly device: Plug,
    readonly apiModuleName: string,
    readonly childId?: string
  ) {
    super(device, apiModuleName, childId);
  }

  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async addRule(
    rule: PlugScheduleRuleInput,
    sendOptions?: SendOptions
  ): ReturnType<Schedule['addRule']> {
    const {
      powerState,
      dimmer,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    } = rule;

    const scheduleRule: PlugScheduleRule = {
      sact: powerState ? 1 : 0,
      name,
      enable: enable ? 1 : 0,
      emin: 0,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    if (isDefinedAndNotNull(dimmer)) {
      scheduleRule.sact = 3;
      scheduleRule.s_dimmer = dimmer;
    }

    return super.addRule(scheduleRule, sendOptions);
  }

  /**
   * Edits Schedule rule.
   *
   * Sends `schedule.edit_rule` command and returns rule id. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async editRule(
    rule: PlugScheduleRuleInput & { id: string },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    const {
      id,
      powerState,
      dimmer,
      start,
      daysOfWeek,
      name = '',
      enable = true,
    } = rule;

    const scheduleRule: PlugScheduleRule & { id: string } = {
      id,
      sact: powerState ? 1 : 0,
      name,
      enable: enable ? 1 : 0,
      emin: 0,
      etime_opt: -1,
      ...createScheduleRule({ start, daysOfWeek }),
    };

    if (isDefinedAndNotNull(dimmer)) {
      scheduleRule.sact = 3;
      scheduleRule.s_dimmer = dimmer;
    }

    return super.editRule(scheduleRule, sendOptions);
  }
}
