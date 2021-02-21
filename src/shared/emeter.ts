import type { AnyDevice, SendOptions } from '../client';
import {
  extractResponse,
  isObjectLike,
  HasErrCode,
  hasErrCode,
} from '../utils';

export type RealtimeV1 = {
  current?: number;
  power?: number;
  total?: number;
  voltage?: number;
};

export type RealtimeV2 = {
  current_ma?: number;
  power_mw?: number;
  total_wh?: number;
  voltage_mv?: number;
};

export type Realtime = RealtimeV1 | RealtimeV2;

type RealtimeNormalized = RealtimeV1 & RealtimeV2;

export function isRealtime(candidate: unknown): candidate is Realtime {
  return isObjectLike(candidate);
}

export default class Emeter {
  #realtime: Realtime = {};

  constructor(
    readonly device: AnyDevice,
    readonly apiModuleName: string,
    readonly childId: string | undefined = undefined
  ) {}

  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @returns {Object}
   */
  get realtime(): Realtime {
    return this.#realtime;
  }

  /**
   * @private
   */
  set realtime(realtime: Realtime) {
    const normRealtime: RealtimeNormalized = { ...realtime }; // will coerce null/undefined to {}

    const normalize = <K extends keyof RealtimeNormalized>(
      key1: K,
      key2: K,
      multiplier: number
    ): void => {
      const r = normRealtime;
      if (typeof r[key1] === 'number' && r[key2] === undefined) {
        r[key2] = Math.floor((r[key1] as number) * multiplier);
      } else if (r[key1] == null && typeof r[key2] === 'number') {
        r[key1] = (r[key2] as number) / multiplier;
      }
    };

    if (realtime != null) {
      normalize('current', 'current_ma', 1000);
      normalize('power', 'power_mw', 1000);
      normalize('total', 'total_wh', 1000);
      normalize('voltage', 'voltage_mv', 1000);
    }

    this.#realtime = normRealtime;
    this.device.emit('emeter-realtime-update', this.#realtime);
  }

  /**
   * Gets device's current energy stats.
   *
   * Requests `emeter.get_realtime`. Older devices return `current`, `voltage`, etc,
   * while newer devices return `current_ma`, `voltage_mv` etc
   * This will return a normalized response including both old and new style properties for backwards compatibility.
   * Supports childId.
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getRealtime(sendOptions?: SendOptions): Promise<unknown> {
    this.realtime = extractResponse<Realtime & HasErrCode>(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { get_realtime: {} },
        },
        this.childId,
        sendOptions
      ),
      '',
      (c) => isRealtime(c) && hasErrCode(c)
    );
    return this.realtime;
  }

  /**
   * Get Daily Emeter Statistics.
   *
   * Sends `emeter.get_daystat` command. Supports childId.
   * @param   year
   * @param   month
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getDayStats(
    year: number,
    month: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_daystat: { year, month } },
      },
      this.childId,
      sendOptions
    );
  }

  /**
   * Get Monthly Emeter Statistics.
   *
   * Sends `emeter.get_monthstat` command. Supports childId.
   * @param   year
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getMonthStats(
    year: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_monthstat: { year } },
      },
      this.childId,
      sendOptions
    );
  }

  /**
   * Erase Emeter Statistics.
   *
   * Sends `emeter.erase_runtime_stat` command. Supports childId.
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async eraseStats(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { erase_emeter_stat: {} },
      },
      this.childId,
      sendOptions
    );
  }
}

module.exports = Emeter;
