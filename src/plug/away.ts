import type { SendOptions } from '../client';
import {
  ScheduleRuleInputTime,
  createRule,
  hasRuleListWithRuleIds,
  type HasRuleListWithRuleIds,
} from '../shared/schedule';
import { extractResponse, hasErrCode, type HasErrCode } from '../utils';
import type Plug from './index';

export type AwayRule = {
  name?: string;
  enable?: number;
  frequency?: number;
  delay?: number;
};

export interface AwayRuleInput {
  /**
   * Date or number of minutes
   */
  start: ScheduleRuleInputTime;
  /**
   * Date or number of minutes (only time component of date is used)
   */
  end: ScheduleRuleInputTime;
  /**
   * [0,6] = weekend, [1,2,3,4,5] = weekdays
   */
  daysOfWeek: number[];
  /**
   * @defaultValue 5
   */
  frequency: number;
  name?: string;
  /**
   * @defaultValue true
   */
  enable: boolean | 0 | 1;
}

export default class Away {
  constructor(
    readonly device: Plug,
    readonly apiModuleName: string,
    readonly childId: string | undefined = undefined,
  ) {}

  /**
   * Gets Away Rules.
   *
   * Requests `anti_theft.get_rules`. Support childId.
   * @throws {@link ResponseError}
   */
  async getRules(
    sendOptions?: SendOptions,
  ): Promise<HasRuleListWithRuleIds & HasErrCode> {
    return extractResponse<HasRuleListWithRuleIds & HasErrCode>(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { get_rules: {} },
        },
        this.childId,
        sendOptions,
      ),
      '',
      (c) => hasRuleListWithRuleIds(c) && hasErrCode(c),
    );
  }

  /**
   * Gets Away Rule.
   *
   * Requests `anti_theft.get_rules` and return rule matching Id. Support childId.
   * @throws {@link ResponseError}
   */
  async getRule(
    id: string,
    sendOptions?: SendOptions,
  ): Promise<{ id: string } & HasErrCode> {
    const rules = await this.getRules(sendOptions);
    const rule = rules.rule_list.find((r) => r.id === id);
    if (rule === undefined) throw new Error(`Rule id not found: ${id}`);
    return { ...rule, err_code: rules.err_code };
  }

  /**
   * Adds Away Rule.
   *
   * Sends `anti_theft.add_rule` command and returns rule id. Support childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async addRule(
    rule: AwayRuleInput,
    sendOptions?: SendOptions,
  ): Promise<unknown> {
    const {
      start,
      end,
      daysOfWeek,
      frequency = 5,
      name = '',
      enable = true,
    } = rule;

    const awayRule: AwayRule = {
      frequency,
      name,
      enable: enable ? 1 : 0,
      ...createRule({ start, end, daysOfWeek }),
    };

    return this.device.sendCommand(
      {
        [this.apiModuleName]: { add_rule: awayRule },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Edits Away rule.
   *
   * Sends `anti_theft.edit_rule` command and returns rule id. Support childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async editRule(
    rule: AwayRuleInput & { id: string },
    sendOptions?: SendOptions,
  ): Promise<unknown> {
    const {
      id,
      start,
      end,
      daysOfWeek,
      frequency = 5,
      name = '',
      enable = true,
    } = rule;

    const awayRule: AwayRule & { id: string } = {
      id,
      frequency,
      name,
      enable: enable ? 1 : 0,
      ...createRule({ start, end, daysOfWeek }),
    };

    return this.device.sendCommand(
      {
        [this.apiModuleName]: { edit_rule: awayRule },
      },
      this.childId,
      sendOptions,
    );
  }

  /**
   * Deletes All Away Rules.
   *
   * Sends `anti_theft.delete_all_rules` command. Support childId.
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
   * Deletes Away Rule.
   *
   * Sends `anti_theft.delete_rule` command. Support childId.
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
   * Enables or Disables Away Rules.
   *
   * Sends `anti_theft.set_overall_enable` command. Support childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async setOverallEnable(
    enable: boolean | 0 | 1,
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
}
