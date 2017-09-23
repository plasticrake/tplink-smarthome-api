'use strict';

const EventEmitter = require('events');

class Device extends EventEmitter {
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
    this._consumption = {};

    if (options.sysInfo) { this.sysInfo = options.sysInfo; }
  }

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

  async sendCommand (command, timeout) {
    let commandObj = ((typeof command === 'string' || command instanceof String) ? JSON.parse(command) : command);
    let response = await this.send(commandObj, timeout);
    let results = processResponse(commandObj, response);
    return results;
  }

  get sysInfo () {
    return this._sysInfo;
  }

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

  get type () {
    return this._type;
  }

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

  startPolling (interval) {
    this.pollingTimer = setInterval(() => {
      this.getInfo();
    }, interval);
    return this;
  }

  stopPolling () {
    clearInterval(this.pollingTimer);
    this.pollingTimer = null;
  }

  async getSysInfo ({timeout} = {}) {
    this.log.debug('[%s] device.getSysInfo()', this.name);
    this.sysInfo = await this.sendCommand('{"system":{"get_sysinfo":{}}}', timeout);
    return this.sysInfo;
  }

  async getModel () {
    let sysInfo = await this.getSysInfo();
    return sysInfo.model;
  }

  async getCloudInfo () {
    this.cloudInfo = await this.sendCommand({ [this.apiModuleNamespace.cloud]: {get_info: {}} });
    return this.cloudInfo;
  }

  async setAlias (value) {
    await this.sendCommand({ [this.apiModuleNamespace.system]: {set_dev_alias: {alias: value}} });
    this.sysInfo.alias = value;
    return true;
  }

  async getScheduleNextAction () {
    return this.sendCommand(`{"${this.apiModuleNamespace.schedule}":{"get_next_action":{}}}`);
  }

  async getScheduleRules () {
    return this.sendCommand(`{"${this.apiModuleNamespace.schedule}":{"get_rules":{}}}`);
  }

  async getTime () {
    return this.sendCommand(`{"${this.apiModuleNamespace.timesetting}":{"get_time":{}}}`);
  }

  async getTimeZone () {
    return this.sendCommand(`{"${this.apiModuleNamespace.timesetting}":{"get_timezone":{}}}`);
  }

  async getScanInfo (refresh = false, timeoutInSeconds = 10) {
    let timeout = ((timeoutInSeconds * 1000) * 2) + this.timeout; // add original timeout to wait for response
    let command = `{"${this.apiModuleNamespace.netif}":{"get_scaninfo":{"refresh":${(refresh ? 1 : 0)},"timeout":${timeoutInSeconds}}}}`;
    return this.sendCommand(command, timeout);
  }

  async getConsumption () {
    let response = await this.sendCommand(`{"${this.apiModuleNamespace.emeter}":{"get_realtime":{}}}`);
    if (response) {
      this.consumption = response;
      return this.consumption;
    }
    throw new Error('Error parsing getConsumption results', response);
  }
}

function processResponse (command, response) {
  let commandResponses = recur(command, response);

  let errors = [];
  commandResponses.forEach((r) => {
    if (r.err_code !== 0) {
      errors.push(r);
    }
  });

  if (errors.length === 1) {
    throw new ResponseError('', errors[0]);
  } else if (errors.length > 1) {
    throw new ResponseError('', errors);
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
