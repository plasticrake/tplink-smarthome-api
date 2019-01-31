'use strict';

const castArray = require('lodash.castarray');
const EventEmitter = require('events');

const TcpConnection = require('../network/tcp-connection');
const UdpConnection = require('../network/udp-connection');
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
    defaultSendOptions
  }) {
    super();

    this.client = client;
    this.host = host;
    this.port = port;

    this.log = logger || this.client.log;
    this.log.debug('device.constructor(%j)', Object.assign({}, arguments[0], { client: 'not shown' }));

    this.defaultSendOptions = Object.assign({}, client.defaultSendOptions, defaultSendOptions);

    this.udpConnection = new UdpConnection(this);
    this.tcpConnection = new TcpConnection(this);

    this.lastState = {};
    this._sysInfo = {};

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
   * @private
   */
  set alias (alias) {
    this.sysInfo.alias = alias;
  }
  /**
   * Cached value of `sys_info.deviceId`.
   * @return {string}
   */
  get id () {
    return this.deviceId;
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
    const type = this.type;
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
    const mac = this.mac || '';
    return mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  }
  /**
   * Closes any open network connections including any shared sockets.
   */
  closeConnection () {
    this.udpConnection.close();
    this.tcpConnection.close();
  }
  /**
   * Sends `payload` to device (using {@link Client#send})
   * @param  {Object|string} payload
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async send (payload, sendOptions) {
    this.log.debug('[%s] device.send()', this.alias);

    try {
      const thisSendOptions = Object.assign({}, this.defaultSendOptions, sendOptions);
      const payloadString = (!(typeof payload === 'string' || payload instanceof String) ? JSON.stringify(payload) : payload);

      if (thisSendOptions.transport === 'udp') {
        return this.udpConnection.send(payloadString, thisSendOptions);
      }
      return this.tcpConnection.send(payloadString, thisSendOptions);
    } catch (err) {
      this.log.error('[%s] device.send() %s', this.alias, err);
      throw err;
    }
  }
  /**
   * Sends command(s) to device.
   *
   * Calls {@link #send} and processes the response.
   *
   * - Adds context.child_ids:[] to the command.
   *   - If `childIds` parameter is set. _or_
   *   - If device was instantiated with a childId it will default to that value.
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
   * @param  {Object|string}    command
   * @param  {string[]|string} [childIds]
   * @param  {SendOptions}     [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async sendCommand (command, childIds = this.childId, sendOptions) {
    // TODO allow certain err codes (particually emeter for non HS110 devices)
    const commandObj = ((typeof command === 'string' || command instanceof String) ? JSON.parse(command) : command);

    if (childIds) {
      const childIdsArray = castArray(childIds).map(this.normalizeChildId, this);
      commandObj.context = { child_ids: childIdsArray };
    }

    const response = await this.send(commandObj, sendOptions);
    const results = processResponse(commandObj, response);
    return results;
  }
  /**
   * @private
   */
  normalizeChildId (childId) {
    let normalizedChildId = childId;
    if (Number.isInteger(childId) && (childId >= 0 && childId < 100)) {
      normalizedChildId = normalizedChildId + '';
    }
    if (typeof normalizedChildId === 'string' || normalizedChildId instanceof String) {
      if (normalizedChildId.length === 1) {
        return (this.deviceId || '') + '0' + normalizedChildId;
      } else if (normalizedChildId.length === 2) {
        return (this.deviceId || '') + normalizedChildId;
      }
    }
    return normalizedChildId;
  }
  /**
   * Polls the device every `interval`.
   *
   * Returns `this` (for chaining) that emits events based on state changes.
   * Refer to specific device sections for event details.
   * @emits  Device#polling-error
   * @param  {number} interval (ms)
   * @return {Device|Bulb|Plug}          this
   */
  startPolling (interval) {
    const fn = async () => {
      try {
        await this.getInfo();
      } catch (err) {
        this.log.debug('[%s] device.startPolling(): getInfo(): error:', this.alias, err);
        /**
         * @event Device#polling-error
         * @property {Error} error
         */
        this.emit('polling-error', err);
      }
    };
    this.pollingTimer = setInterval(fn, interval);
    fn();
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
   * Requests `system.sys_info` from device. Does not support childId.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getSysInfo (sendOptions) {
    this.log.debug('[%s] device.getSysInfo()', this.alias);
    this.sysInfo = await this.sendCommand('{"system":{"get_sysinfo":{}}}', null, sendOptions);
    return this.sysInfo;
  }
  /**
   * Change device's alias (name).
   *
   * Sends `system.set_dev_alias` command. Supports childId.
   * @param  {string}       alias
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setAlias (alias, sendOptions) {
    await this.sendCommand({
      [this.apiModuleNamespace.system]: { set_dev_alias: { alias: alias } }
    }, this.childId, sendOptions);
    this.alias = alias;
    return true;
  }
  /**
   * Set device's location.
   *
   * Sends `system.set_dev_location` command. Does not support childId.
   * @param  {number}       latitude
   * @param  {number}       longitude
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setLocation (latitude, longitude, sendOptions) {
    const latitude_i = Math.round(latitude * 10000); // eslint-disable-line camelcase
    const longitude_i = Math.round(longitude * 10000); // eslint-disable-line camelcase
    return this.sendCommand({
      [this.apiModuleNamespace.system]: {
        set_dev_location: { latitude, longitude, latitude_i, longitude_i }
      }
    }, null, sendOptions);
  }
  /**
   * Gets device's model.
   *
   * Requests `system.sys_info` and returns model name. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getModel (sendOptions) {
    const sysInfo = await this.getSysInfo(sendOptions);
    return sysInfo.model;
  }
  /**
   * Reboot device.
   *
   * Sends `system.reboot` command. Does not support childId.
   * @param  {number}       delay
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async reboot (delay, sendOptions) {
    return this.sendCommand({
      [this.apiModuleNamespace.system]: { reboot: { delay } }
    }, null, sendOptions);
  }
  /**
   * Reset device.
   *
   * Sends `system.reset` command. Does not support childId.
   * @param  {number}       delay
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async reset (delay, sendOptions) {
    return this.sendCommand({
      [this.apiModuleNamespace.system]: { reset: { delay } }
    }, null, sendOptions);
  }
}

/**
 * @private
 */
function processResponse (command, response) {
  const multipleResponses = (Object.keys(response).length > 1);
  const commandResponses = recur(command, response);

  const errors = [];
  commandResponses.forEach((r) => {
    if (r.response.err_code == null) {
      errors.push({ msg: 'err_code missing', response: r.response, section: r.section });
    } else if (r.response.err_code !== 0) {
      errors.push({ msg: 'err_code not zero', response: r.response, section: r.section });
    }
  });

  if (errors.length === 1 && !multipleResponses) {
    throw new ResponseError(errors[0].msg, errors[0].response, command, errors[0].section);
  } else if (errors.length > 0) {
    throw new ResponseError('err_code', response, command, errors.map((e) => e.section));
  }

  if (commandResponses.length === 1) {
    return commandResponses[0].response;
  }
  return response;

  function recur (command, response, depth = 0, section, results = []) {
    const keys = Object.keys(command);
    if (keys.length === 0) { results.push(response); }
    for (var i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (depth === 1) {
        if (response[key]) {
          results.push({ section, response: response[key] });
        } else {
          return results.push({ section, response });
        }
      } else if (depth < 1) {
        section = key;
        if (response[key] !== undefined) {
          recur(command[key], response[key], depth + 1, section, results);
        }
      }
    }
    return results;
  }
}

module.exports = Device;
