import type { MarkRequired } from 'ts-essentials';

import type { AnyDevice, SendOptions } from '../client';
import {
  extractResponse,
  hasErrCode,
  isDefinedAndNotNull,
  isObjectLike,
  type HasErrCode,
} from '../utils';

export type ScheduleDateStart = {
  smin: number;
  stime_opt: number;
};

type ScheduleDateEnd = {
  emin: number;
  etime_opt: number;
};

export type WDay = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
];

export type ScheduleRule = {
  name?: string;
  enable?: number;
  day?: number;
  month?: number;
  year?: number;
  wday?: WDay;
  repeat?: boolean;
  etime_opt: -1;
  emin: -1 | 0;
} & (ScheduleDateStart | Record<string, unknown>);

export type ScheduleRuleWithId = ScheduleRule & { id: string };

export type ScheduleRules = { rule_list: ScheduleRuleWithId[] };
export type ScheduleNextAction = Record<string, unknown>;

export type ScheduleRuleResponse = ScheduleRule & HasErrCode;
export type ScheduleRulesResponse = ScheduleRules & HasErrCode;
export type ScheduleNextActionResponse = ScheduleNextAction & HasErrCode;

function isScheduleNextAction(
  candidate: unknown,
): candidate is ScheduleNextAction {
  return isObjectLike(candidate);
}

export function isScheduleNextActionResponse(
  candidate: unknown,
): candidate is ScheduleNextActionResponse {
  return isScheduleNextAction(candidate) && hasErrCode(candidate);
}

export type HasRuleListWithRuleIds = { rule_list: { id: string }[] };

export function hasRuleListWithRuleIds(
  candidate: unknown,
): candidate is { rule_list: { id: string }[] } {
  return (
    isObjectLike(candidate) &&
    'rule_list' in candidate &&
    isObjectLike(candidate.rule_list) &&
    Array.isArray(candidate.rule_list) &&
    candidate.rule_list.every(
      (rule) =>
        isObjectLike(rule) && 'id' in rule && typeof rule.id === 'string',
    )
  );
}

function isScheduleRules(candidate: unknown): candidate is ScheduleRules {
  return (
    isObjectLike(candidate) &&
    'rule_list' in candidate &&
    isObjectLike(candidate.rule_list) &&
    Array.isArray(candidate.rule_list) &&
    candidate.rule_list.every(
      (rule) =>
        isObjectLike(rule) && 'id' in rule && typeof rule.id === 'string',
    )
  );
}

export function isScheduleRulesResponse(
  candidate: unknown,
): candidate is ScheduleNextActionResponse {
  return isScheduleRules(candidate) && hasErrCode(candidate);
}

export type ScheduleRuleInputTime = Date | number | 'sunrise' | 'sunset';

function createScheduleDate(
  date: ScheduleRuleInputTime,
  startOrEnd: 'start' | 'end',
): ScheduleDateStart | ScheduleDateEnd {
  let min = 0;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let time_opt = 0;

  if (date instanceof Date) {
    min = date.getHours() * 60 + date.getMinutes();
  } else if (typeof date === 'number') {
    min = date;
  } else if (date === 'sunrise') {
    min = 0;
    time_opt = 1;
    // We want to validate
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (date === 'sunset') {
    min = 0;
    time_opt = 2;
  } else {
    throw new Error('invalid date');
  }

  if (startOrEnd === 'end') {
    return { emin: min, etime_opt: time_opt };
  }
  return { smin: min, stime_opt: time_opt };
}

function createScheduleDateStart(
  date: ScheduleRuleInputTime,
): ScheduleDateStart {
  return createScheduleDate(date, 'start') as ScheduleDateStart;
}

function createScheduleDateEnd(date: ScheduleRuleInputTime): ScheduleDateEnd {
  return createScheduleDate(date, 'end') as ScheduleDateEnd;
}

function createWday(daysOfWeek: number[]): WDay {
  const wday: WDay = [false, false, false, false, false, false, false];
  daysOfWeek.forEach((dw) => {
    wday[dw] = true;
  });
  return wday;
}

export function createScheduleRule({
  start,
  daysOfWeek,
}: {
  start: ScheduleRuleInputTime;
  daysOfWeek?: number[];
}): ScheduleDateStart & {
  wday: WDay;
  repeat: boolean;
  day?: number;
  month?: number;
  year?: number;
} {
  const sched: ScheduleDateStart &
    Partial<{
      wday: WDay;
      repeat: boolean;
      day?: number;
      month?: number;
      year?: number;
    }> = createScheduleDateStart(start);

  if (isDefinedAndNotNull(daysOfWeek) && daysOfWeek.length > 0) {
    sched.wday = createWday(daysOfWeek);
    sched.repeat = true;
  } else {
    const date = start instanceof Date ? start : new Date();
    sched.day = date.getDate();
    sched.month = date.getMonth() + 1;
    sched.year = date.getFullYear();
    sched.wday = [false, false, false, false, false, false, false];
    sched.wday[date.getDay()] = true;
    sched.repeat = false;
  }

  return sched as MarkRequired<typeof sched, 'wday' | 'repeat'>;
}

export function createRule({
  start,
  end,
  daysOfWeek,
}: {
  start: ScheduleRuleInputTime;
  end?: ScheduleRuleInputTime;
  daysOfWeek?: number[];
}): MarkRequired<Partial<ScheduleRule>, 'wday' | 'repeat'> & ScheduleDateStart {
  const sched: Partial<ScheduleRule> & ScheduleDateStart =
    createScheduleDateStart(start);

  if (isDefinedAndNotNull(end)) {
    Object.assign(sched, createScheduleDateEnd(end));
  }

  if (isDefinedAndNotNull(daysOfWeek) && daysOfWeek.length > 0) {
    sched.wday = createWday(daysOfWeek);
    sched.repeat = true;
  } else {
    const date = start instanceof Date ? start : new Date();
    sched.day = date.getDate();
    sched.month = date.getMonth() + 1;
    sched.year = date.getFullYear();
    sched.wday = [false, false, false, false, false, false, false];
    sched.wday[date.getDay()] = true;
    sched.repeat = false;
  }

  return sched as MarkRequired<Partial<ScheduleRule>, 'wday' | 'repeat'> &
    ScheduleDateStart;
}

export default abstract class Schedule {
  nextAction: ScheduleNextActionResponse | undefined;

  constructor(
    readonly device: AnyDevice,
    readonly apiModuleName: string,
    readonly childId?: string,
  ) {}

  /**
   * Gets Next Schedule Rule Action.
   *
   * Requests `schedule.get_next_action`. Supports childId.
   * @throws {@link ResponseError}
   */
  async getNextAction(
    sendOptions?: SendOptions,
  ): Promise<ScheduleNextActionResponse> {
    this.nextAction = extractResponse<ScheduleNextActionResponse>(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { get_next_action: {} },
        },
        this.childId,
        sendOptions,
      ),
      '',
      isScheduleNextActionResponse,
    );

    return this.nextAction;
  }

  /**
   * Gets Schedule Rules.
   *
   * Requests `schedule.get_rules`. Supports childId.
   * @throws {@link ResponseError}
   */
  async getRules(sendOptions?: SendOptions): Promise<ScheduleRulesResponse> {
    return extractResponse<ScheduleRulesResponse>(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { get_rules: {} },
        },
        this.childId,
        sendOptions,
      ),
      '',
      isScheduleRulesResponse,
    );
  }

  /**
   * Gets Schedule Rule.
   *
   * Requests `schedule.get_rules` and return rule matching Id. Supports childId.
   * @throws {@link ResponseError}
   * @throws Error
   */
  async getRule(
    id: string,
    sendOptions?: SendOptions,
  ): Promise<ScheduleRuleResponse> {
    const rules = await this.getRules(sendOptions);

    const rule: ScheduleRule | undefined = rules.rule_list.find(
      (r) => r.id === id,
    );
    if (rule === undefined) throw new Error(`Rule id not found: ${id}`);

    return { ...rule, err_code: rules.err_code };
  }

  /**
   * Adds Schedule rule.
   *
   * Sends `schedule.add_rule` command and returns rule id. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */

  async addRule(
    rule: object,
    sendOptions?: SendOptions,
  ): Promise<{ id: string }> {
    return extractResponse<{ id: string }>(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { add_rule: rule },
        },
        this.childId,
        sendOptions,
      ),
      '',
      (candidate) => {
        return isObjectLike(candidate) && typeof candidate.id === 'string';
      },
    );
  }

  /**
   * Edits Schedule Rule.
   *
   * Sends `schedule.edit_rule` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async editRule(rule: object, sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { edit_rule: rule },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Deletes All Schedule Rules.
   *
   * Sends `schedule.delete_all_rules` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async deleteAllRules(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { delete_all_rules: {} },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Deletes Schedule Rule.
   *
   * Sends `schedule.delete_rule` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async deleteRule(id: string, sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { delete_rule: { id } },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Enables or Disables Schedule Rules.
   *
   * Sends `schedule.set_overall_enable` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async setOverallEnable(
    enable: boolean,
    sendOptions?: SendOptions,
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_overall_enable: { enable: enable ? 1 : 0 },
        },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Get Daily Usage Statistics.
   *
   * Sends `schedule.get_daystat` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getDayStats(
    year: number,
    month: number,
    sendOptions?: SendOptions,
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_daystat: { year, month } },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Get Monthly Usage Statistics.
   *
   * Sends `schedule.get_monthstat` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getMonthStats(
    year: number,
    sendOptions?: SendOptions,
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_monthstat: { year } },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Erase Usage Statistics.
   *
   * Sends `schedule.erase_runtime_stat` command. Supports childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async eraseStats(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { erase_runtime_stat: {} },
      },
      this.childId,
      sendOptions,
    );
  }
}
