import clone from 'lodash.clone';
import type { SendOptions } from '../client';
import type Device from '.';

export default class Netif {
  constructor(readonly device: Device, readonly apiModuleName: string) {}

  /**
   * Requests `netif.get_scaninfo` (list of WiFi networks).
   *
   * Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
   * The network timeout for the request is calculated by adding the
   * default network timeout to `timeoutInSeconds`.
   * @param  refresh - request device's cached results
   * @param  timeoutInSeconds - timeout for scan in seconds
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getScanInfo(
    refresh = false,
    timeoutInSeconds = 10,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    const sendOptionsWithTimeout = clone(sendOptions || {});
    if (sendOptionsWithTimeout.timeout == null) {
      sendOptionsWithTimeout.timeout =
        timeoutInSeconds * 1000 * 2 +
        (this.device.defaultSendOptions.timeout || 5000);
    }
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          get_scaninfo: {
            refresh: refresh ? 1 : 0,
            timeout: timeoutInSeconds,
          },
        },
      },
      undefined,
      sendOptions
    );
  }
}
