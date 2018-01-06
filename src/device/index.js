'use strict';

const EventEmitter = require('events');

const Netif = require('./netif');
const { ResponseError } = require('../utils');

/**
 * TP-Link Device.
 *
 * Shared behavior for {@link Plug} and {@link Bulb}.
 * @extends EventEmitter
 * @emits  Device#emeter-realtime-update
 */
class Device extends EventEmitter {
  /**
   * Created by {@link Client#getCommonDevice} - Do not instantiate directly
   * @param  {Object}       options
   * @param  {Client}       options.client
   * @param  {Object}       options.sysInfo
   * @param  {string}       options.host
   * @param  {number}      [options.port=9999]
   * @param  {Object}      [options.logger]
   * @param  {SendOptions} [options.defaultSendOptions]
   */
  constructor ({
    client,
    sysInfo,
    host,
    port = 9999,
    logger,
    defaultSendOptions = { transport: 'tcp', timeout: 5000 }
  }) {
    super();

    this.client = client;
    this.host = host;
    this.port = port;
    this.defaultSendOptions = defaultSendOptions;
    this.log = logger || this.client.log;
    this.log.debug('device.constructor(%j)', Object.assign({}, arguments[0], { client: 'not shown' }));

    this.lastState = {};

    this._sysInfo = {};

    if (sysInfo) { this.sysInfo = sysInfo; }

    this.netif = new Netif(this, 'netif');
  }
  /**
   * Returns cached results from last retrieval of `system.sys_info`.
   * @return {Object} system.sys_info
   */
  get sysInfo () {
    return this._sysInfo;
  }
  /**
   * @private
   */
  set sysInfo (sysInfo) {
    this.log.debug('[%s] device sysInfo set', (sysInfo.alias || this.alias));
    this._sysInfo = sysInfo;
  }
  /**
   * Cached value of `sys_info.alias`.
   * @return {string}
   */
  get alias () {
    return this.sysInfo.alias;
  }
  /**
   * Cached value of `sys_info.deviceId`.
   * @return {string}
   */
  get deviceId () {
    return this.sysInfo.deviceId;
  }
  /**
   * Cached value of `sys_info.[description|dev_name]`.
   * @return {string}
   */
  get description () {
    return this.sysInfo.description || this.sysInfo.dev_name;
  }
  /**
   * Cached value of `sys_info.model`.
   * @return {string}
   */
  get model () {
    return this.sysInfo.model;
  }
  /**
   * Cached value of `sys_info.alias`.
   * @return {string}
   */
  get name () {
    return this.alias;
  }
  /**
   * Cached value of `sys_info.[type|mic_type]`.
   * @return {string}
   */
  get type () {
    return this.sysInfo.type || this.sysInfo.mic_type;
  }
  /**
   * Type of device (or `device` if unknown).
   *
   * Based on cached value of `sys_info.[type|mic_type]`
   * @return {string} 'plub'|'bulb'|'device'
   */
  get deviceType () {
    let type = this.type;
    switch (true) {
      case (/plug/i).test(type): return 'plug';
      case (/bulb/i).test(type): return 'bulb';
      default: return 'device';
    }
  }
  /**
   * Cached value of `sys_info.sw_ver`.
   * @return {string}
   */
  get softwareVersion () {
    return this.sysInfo.sw_ver;
  }
  /**
   * Cached value of `sys_info.hw_ver`.
   * @return {string}
   */
  get hardwareVersion () {
    return this.sysInfo.hw_ver;
  }
  /**
   * Cached value of `sys_info.[mac|mic_mac|ethernet_mac]`.
   * @return {string}
   */
  get mac () {
    return this.sysInfo.mac || this.sysInfo.mic_mac || this.sysInfo.ethernet_mac;
  }
  /**
   * Normalized cached value of `sys_info.[mac|mic_mac|ethernet_mac]`
   *
   * Removes all non alphanumeric characters and makes uppercase
   * `aa:bb:cc:00:11:22` will be normalized to `AABBCC001122`
   * @return {string}
   */
  get macNormalized () {
    let mac = this.mac || '';
    return mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }
  /**
   * Sends `payload` to device (using {@link Client#send})
   * @param  {Object|string} payload
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async send (payload, sendOptions) {
    this.log.debug('[%s] device.send()', this.alias);
    let thisSendOptions = Object.assign({}, this.defaultSendOptions, sendOptions);
    return this.client.send(payload, this.host, this.port, thisSendOptions)
      .catch((reason) => {
        this.log.error('[%s] device.send() %s', this.alias, reason);
        this.log.debug(payload);
        throw reason;
      });
  }
  /**
   * Sends command(s) to device.
   *
   * Calls {@link #send} and processes the response.
   *
   * - If only one operation was sent:
   *   - Promise fulfills with specific parsed JSON response for command.\
   *     Example: `{system:{get_sysinfo:{}}}`
   *     - resolves to: `{err_code:0,...}`\
   *     - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as {@link #send} would)
   * - If more than one operation was sent:
   *   - Promise fulfills with full parsed JSON response (same as {@link #send})
   *
   * Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with {@link ResponseError}.
   * @param  {Object|string} command
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async sendCommand (command, sendOptions) {
    // TODO allow certain err codes (particually emeter for non HS110 devices)
    let commandObj = ((typeof command === 'string' || command instanceof String) ? JSON.parse(command) : command);
    let response = await this.send(commandObj, sendOptions);
    let results = processResponse(commandObj, response);
    return results;
  }
  /**
   * Polls the device every `interval`.
   *
   * Returns `this` (for chaining) that emits events based on state changes.
   * Refer to specific device sections for event details.
   * @param  {number} interval (ms)
   * @return {Device|Bulb|Plug}          this
   */
  startPolling (interval) {
    // TODO
    this.pollingTimer = setInterval(() => {
      this.getInfo();
    }, interval);
    return this;
  }
  /**
   * Stops device polling.
   */
  stopPolling () {
    clearInterval(this.pollingTimer);
    this.pollingTimer = null;
  }
  /**
   * Gets device's SysInfo.
   *
   * Requests `system.sys_info` from device.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getSysInfo (sendOptions) {
    this.log.debug('[%s] device.getSysInfo()', this.alias);
    this.sysInfo = await this.sendCommand('{"system":{"get_sysinfo":{}}}', sendOptions);
    return this.sysInfo;
  }
  /**
   * Change device's alias (name).
   *
   * Sends `system.set_dev_alias` command.
   * @param  {string}       alias
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setAlias (alias, sendOptions) {
    await this.sendCommand({
      [this.apiModuleNamespace.system]: { set_dev_alias: { alias: alias } }
    }, sendOptions);
    this.sysInfo.alias = alias;
    return true;
  }
  /**
   * Set device's location.
   *
   * Sends `system.set_dev_location` command.
   * @param  {number}       latitude
   * @param  {number}       longitude
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setLocation (latitude, longitude, sendOptions) {
    let latitude_i = Math.round(latitude * 10000); // eslint-disable-line camelcase
    let longitude_i = Math.round(longitude * 10000); // eslint-disable-line camelcase
    return this.sendCommand({
      [this.apiModuleNamespace.system]: {
        set_dev_location: { latitude, longitude, latitude_i, longitude_i }
      }
    }, sendOptions);
  }
  /**
   * Gets device's model.
   *
   * Requests `system.sys_info` and returns model name.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getModel (sendOptions) {
    let sysInfo = await this.getSysInfo(sendOptions);
    return sysInfo.model;
  }
  /**
   * Reboot device.
   *
   * Sends `system.reboot` command.
   * @param  {number}       delay
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async reboot (delay, sendOptions) {
    return this.sendCommand({
      [this.apiModuleNamespace.system]: {reboot: {delay}}
    }, sendOptions);
  }
  /**
   * Reset device.
   *
   * Sends `system.reset` command.
   * @param  {number}       delay
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async reset (delay, sendOptions) {
    return this.sendCommand({
      [this.apiModuleNamespace.system]: {reset: {delay}}
    }, sendOptions);
  }
}

/**
 * @private
 */
function processResponse (command, response) {
  let commandResponses = recur(command, response);

  let errors = [];
  commandResponses.forEach((r) => {
    if (r.err_code == null) {
      errors.push({msg: 'err_code missing', response: r});
    } else if (r.err_code !== 0) {
      errors.push({msg: 'err_code not zero', response: r});
    }
  });

  if (errors.length === 1) {
    throw new ResponseError(errors[0].msg, errors[0].response);
  } else if (errors.length > 1) {
    throw new ResponseError('err_code', response);
  }

  if (commandResponses.length === 1) {
    return commandResponses[0];
  }
  return response;

  function recur (command, response, depth = 0, results = []) {
    let keys = Object.keys(command);
    if (keys.length === 0) { results.push(response); }
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (depth === 1) {
        if (response[key]) {
          results.push(response[key]);
        } else {
          return results.push(response);
        }
      } else if (depth < 1) {
        if (response[key] !== undefined) {
          recur(command[key], response[key], depth + 1, results);
        }
      }
    }
    return results;
  }
}

module.exports = Device;
