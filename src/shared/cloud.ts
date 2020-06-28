import type { AnyDevice, SendOptions } from '../client';
import {
  extractResponse,
  isObjectLike,
  HasErrCode,
  hasErrCode,
} from '../utils';

export type CloudInfo = {
  username?: string;
  server?: string;
  binded?: number;
  cld_connection?: number;
  illegalType?: number;
  tcspStatus?: number;
  fwDlPage?: string;
  tcspInfo?: string;
  stopConnect?: number;
  fwNotifyType?: number;
};

export function isCloudInfo(candidate: unknown): candidate is CloudInfo {
  return isObjectLike(candidate);
}

export default class Cloud {
  info: (CloudInfo & HasErrCode) | undefined;

  constructor(readonly device: AnyDevice, readonly apiModuleName: string) {}

  /**
   * Gets device's TP-Link cloud info.
   *
   * Requests `cloud.get_info`. Does not support childId.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getInfo(sendOptions?: SendOptions): Promise<CloudInfo & HasErrCode> {
    this.info = extractResponse<CloudInfo & HasErrCode>(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { get_info: {} },
        },
        undefined,
        sendOptions
      ),
      '',
      (c) => isCloudInfo(c) && hasErrCode(c)
    );
    return this.info;
  }

  /**
   * Add device to TP-Link cloud.
   *
   * Sends `cloud.bind` command. Does not support childId.
   * @param   username
   * @param   password
   * @param   sendOptions
   * @returns parsed JSON response
   */
  async bind(
    username: string,
    password: string,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { bind: { username, password } },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Remove device from TP-Link cloud.
   *
   * Sends `cloud.unbind` command. Does not support childId.
   * @param   sendOptions
   * @returns parsed JSON response
   */
  async unbind(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { unbind: {} },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Get device's TP-Link cloud firmware list.
   *
   * Sends `cloud.get_intl_fw_list` command. Does not support childId.
   * @param   sendOptions
   * @returns parsed JSON response
   */
  async getFirmwareList(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_intl_fw_list: {} },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Sets device's TP-Link cloud server URL.
   *
   * Sends `cloud.set_server_url` command. Does not support childId.
   * @param   server - URL
   * @param   sendOptions
   * @returns parsed JSON response
   */
  async setServerUrl(
    server: string,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { set_server_url: { server } },
      },
      undefined,
      sendOptions
    );
  }
}
