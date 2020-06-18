import type { AnyDevice, SendOptions } from '../client';

export default class Time {
  constructor(readonly device: AnyDevice, readonly apiModuleName: string) {}

  /**
   * Gets device's time.
   *
   * Requests `timesetting.get_time`. Does not support ChildId.
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async getTime(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_time: {} },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Gets device's timezone.
   *
   * Requests `timesetting.get_timezone`. Does not support ChildId.
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async getTimezone(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_timezone: {} },
      },
      undefined,
      sendOptions
    );
  }
}
