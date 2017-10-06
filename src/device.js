'use strict';

const EventEmitter = require('events');

const ResponseError = require('./utils').ResponseError;

/**
 * TP-Link Device.
 *
 * Shared behavior for {@link Plug} and {@link Bulb}.
 * @extends EventEmitter
 */
class Device extends EventEmitter {
  /**
   * Created by {@link Client#getGeneralDevice} - Do not instantiate directly
   * @param  {Object} options
   * @param  {Client} options.client
   * @param  {string} options.host
   * @param  {number} [options.port=9999]
   * @param  {string} [options.deviceId]
   * @param  {number} [options.seenOnDiscovery]
   * @param  {number} [options.timeout]
   * @param  {Object} [options.logger]
   */
  constructor (options) {
    super();
    if (typeof options === 'undefined') options = {};

    this.client = options.client;
    this.host = options.host;
    this.port = options.port || 9999;

    this.deviceId = options.deviceId;
    this.seenOnDiscovery = options.seenOnDiscovery || null;
    this.timeout = options.timeout || this.client.timeout || 5000;
    this.log = options.logger || this.client.log;
    this.log.debug('device.constructor(%j)', Object.assign({}, options, {client: 'not shown'}));

    this.name = this.deviceId || this.host; // Overwritten by alias later
    this.model = null;
    this.type = null;

    this.lastState = {};

    this._sysInfo = {};
    this._emeterRealtime = {};

    if (options.sysInfo) { this.sysInfo = options.sysInfo; }
  }
  /**
   * Sends `payload` to device (using {@link Client#send})
   * @param  {Object|string}  payload
   * @param  {number}         [timeout]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async send (payload, timeout = null) {
    timeout = (timeout == null ? this.timeout : timeout);
    this.log.debug('[%s] device.send()', this.name);
    return this.client.send({host: this.host, port: this.port, payload, timeout})
      .catch((reason) => {
        this.log.error('[%s] device.send() %s', this.name, reason);
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
   *   - Promise fulfills with specific parsed JSON response for comand.\
   *     Example: `{system:{get_sysinfo:{}}}`
   *     - resolves to: `{err_code:0,...}`\
   *     - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as {@link #send} would)
   * - If more than one operation was sent:
   *   - Promise fulfills with full parsed JSON response (same as {@link #send})
   *
   * Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with {@link ResponseError}.
   * @param  {Object|string}  command
   * @param  {number}  [timeout]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async sendCommand (command, timeout) {
    // TODO allow certain err codes (particually emeter for non HS110 devices)
    let commandObj = ((typeof command === 'string' || command instanceof String) ? JSON.parse(command) : command);
    let response = await this.send(commandObj, timeout);
    let results = processResponse(commandObj, response);
    return results;
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
    this.log.debug('[%s] device sysInfo set', (sysInfo.alias || this.name));
    this._sysInfo = sysInfo;
    this.name = sysInfo.alias;
    this.deviceId = sysInfo.deviceId;
    this.deviceName = sysInfo.dev_name;
    this.model = sysInfo.model;
    this.type = sysInfo.type || sysInfo.mic_type;
    this.softwareVersion = sysInfo.sw_ver;
    this.hardwareVersion = sysInfo.hw_ver;
    this.mac = sysInfo.mac;
  }
  /**
   * Returns cached results from last retrieval of `emeter.get_realtime`.
   * @return {Object}
   */
  get emeterRealtime () { return this._emeterRealtime; }
  /**
   * @private
   */
  set emeterRealtime (emeterRealtime) {
    this._emeterRealtime = emeterRealtime;
  }
  get type () {
    return this._type;
  }

  /**
   * @private
   */
  set type (type) {
    switch (type) {
      case 'IOT.SMARTPLUGSWITCH':
      case 'plug':
        type = 'plug';
        break;
      case 'IOT.SMARTBULB':
      case 'bulb':
        type = 'bulb';
        break;
      default:
        type = 'device';
        break;
    }
    this._type = type;
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
   * @param  {number}  [timeout]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getSysInfo ({timeout} = {}) {
    this.log.debug('[%s] device.getSysInfo()', this.name);
    this.sysInfo = await this.sendCommand('{"system":{"get_sysinfo":{}}}', timeout);
    return this.sysInfo;
  }
  /**
   * Gets device's model.
   *
   * Requests `system.sys_info` and returns model name.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getModel () {
    let sysInfo = await this.getSysInfo();
    return sysInfo.model;
  }
  /**
   * Gets device's TP-Link Cloud info.
   *
   * Requests `cloud.get_info`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getCloudInfo () {
    this.cloudInfo = await this.sendCommand({ [this.apiModuleNamespace.cloud]: {get_info: {}} });
    return this.cloudInfo;
  }
  /**
   * Change device's alias (name).
   *
   * Sends `system.set_dev_alias` command.
   * @param  {string}  alias
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setAlias (alias) {
    await this.sendCommand({ [this.apiModuleNamespace.system]: {set_dev_alias: {alias: alias}} });
    this.sysInfo.alias = alias;
    return true;
  async getEmeterRealtime () {
    let response = await this.sendCommand(`{"${this.apiModuleNamespace.emeter}":{"get_realtime":{}}}`);
    if (response) {
      this.emeterRealtime = response;
      return this.emeterRealtime;
    }
    throw new Error('Error parsing getEmeterRealtime results', response);
  }
  }
  /**
   * Gets Next Schedule Rule Action.
   *
   * Requests `schedule.get_next_action`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getScheduleNextAction () {
    return this.sendCommand(`{"${this.apiModuleNamespace.schedule}":{"get_next_action":{}}}`);
  }
  /**
   * Gets Schedule Rules.
   *
   * Requests `schedule.get_rules`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getScheduleRules () {
    return this.sendCommand(`{"${this.apiModuleNamespace.schedule}":{"get_rules":{}}}`);
  }
  /**
   * Gets device's time.
   *
   * Requests `timesetting.get_time`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getTime () {
    return this.sendCommand(`{"${this.apiModuleNamespace.timesetting}":{"get_time":{}}}`);
  }
  /**
   * Gets device's timezone.
   *
   * Requests `timesetting.get_timezone`.
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getTimeZone () {
    return this.sendCommand(`{"${this.apiModuleNamespace.timesetting}":{"get_timezone":{}}}`);
  }
  /**
   * Requests `netif.get_scaninfo` (list of WiFi networks).
   *
   * Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
   * The network timeout for the request is calculated by adding the
   * default network timeout to the request timeout.
   * @param  {Boolean} [refresh=false]       request device's cached results
   * @param  {number}  [timeoutInSeconds=10] timeout for scan in seconds
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getScanInfo (refresh = false, timeoutInSeconds = 10) {
    let timeout = ((timeoutInSeconds * 1000) * 2) + this.timeout; // add original timeout to wait for response
    let command = `{"${this.apiModuleNamespace.netif}":{"get_scaninfo":{"refresh":${(refresh ? 1 : 0)},"timeout":${timeoutInSeconds}}}}`;
    return this.sendCommand(command, timeout);
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
    throw new ResponseError('err_code', errors.map(e => e[response]));
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
