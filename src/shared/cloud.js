'use strict';

/**
 * Cloud
 */
class Cloud {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }
  /**
   * Gets device's TP-Link cloud info.
   *
   * Requests `cloud.get_info`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getInfo (sendOptions) {
    this.info = await this.device.sendCommand({
      [this.apiModuleName]: { get_info: {} }
    }, sendOptions);
    return this.info;
  }
  /**
   * Add device to TP-Link cloud.
   *
   * Sends `cloud.bind` command.
   * @param  {string}       username
   * @param  {string}       password
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async bind (username, password, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { bind: { username, password } }
    }, sendOptions);
  }
  /**
   * Remove device from TP-Link cloud.
   *
   * Sends `cloud.unbind` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async unbind (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { unbind: {} }
    }, sendOptions);
  }
  /**
   * Get device's TP-Link cloud firmware list.
   *
   * Sends `cloud.get_intl_fw_list` command.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getFirmwareList (sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { get_intl_fw_list: {} }
    }, sendOptions);
  }
  /**
   * Sets device's TP-Link cloud server URL.
   *
   * Sends `cloud.set_server_url` command.
   * @param  {string}       server URL
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setServerUrl (server, sendOptions) {
    return this.device.sendCommand({
      [this.apiModuleName]: { set_server_url: { server } }
    }, sendOptions);
  }
}

module.exports = Cloud;
