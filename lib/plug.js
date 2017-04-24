'use strict';

const net = require('net');
const EventEmitter = require('events');

const encryptWithHeader = require('./utils').encryptWithHeader;
const decrypt = require('./utils').decrypt;

var commands = {
  search: '{"system":{"get_sysinfo":{}}}',

  info: '{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}',
  getSysInfo: '{"system":{"get_sysinfo":{}}}',
  getCloudInfo: '{"cnCloud":{"get_info":{}}}',

  getScheduleNextAction: '{"schedule":{"get_next_action":{}}}',
  getScheduleRules: '{"schedule":{"get_rules":{}}}',
  getAwayRules: '{"anti_theft":{"get_rules":{}}}',
  getTimerRules: '{"count_down":{"get_rules":{}}}',
  getConsumption: '{"emeter":{"get_realtime":{}}}',
  getTime: '{"time":{"get_time":{}}}',
  getTimeZone: '{"time":{"get_timezone":{}}}',
  getScanInfo: (refresh, timeout) => `{"netif":{"get_scaninfo":{"refresh":${(refresh ? 1 : 0)},"timeout":${timeout}}}}`,

  setPowerState: (state) => `{"system":{"set_relay_state":{"state":${(state ? 1 : 0)}}}}`,
  setLedState: (state) => `{"system":{"set_led_off":{"off":${(state ? 0 : 1)}}}}`
};

class Plug extends EventEmitter {
  constructor (options) {
    super();
    if (typeof options === 'undefined') options = {};
    this.client = options.client;
    this.deviceId = options.deviceId;
    this.host = options.host;
    this.port = options.port || 9999;
    this.seenOnDiscovery = options.seenOnDiscovery || null;
    this.timeout = options.timeout || 0;
    this.inUseThreshold = options.inUseThreshold || 0;

    this.model = null;
    this.lastState = { relayOn: null, inUse: null };

    this._sysInfo = {};
    this._consumption = {};
  }

  get sysInfo () { return this._sysInfo; }

  set sysInfo (sysInfo) {
    this._sysInfo = sysInfo;
    this.name = sysInfo.alias;
    this.deviceId = sysInfo.deviceId;
    this.deviceName = sysInfo.dev_name;
    this.model = sysInfo.model;
    this.softwareVersion = sysInfo.sw_ver;
    this.hardwareVersion = sysInfo.hw_ver;
    this.mac = sysInfo.mac;
    this.latitude = sysInfo.latitude;
    this.longitude = sysInfo.longitude;
    this.supportsConsumption = (sysInfo.feature.includes('ENE'));
    this.emitEvents();
  }

  get consumption () { return this._consumption; }

  set consumption (consumption) {
    this._consumption = consumption;
    if (this.supportsConsumption) {
      this.emitEvents();
    }
  }

  emitEvents () {
    var inUse;
    if (this.consumption && this.consumption.err_code === 0) { // Supports Consumption
      inUse = (this.consumption.power > this.inUseThreshold);
    } else {
      inUse = (this.sysInfo.relay_state === 1);
    }

    if (this.lastState.inUse !== inUse) {
      this.lastState.inUse = inUse;
      if (inUse) {
        this.emit('in-use', this);
      } else {
        this.emit('not-in-use', this);
      }
    }

    var relayOn = (this.sysInfo.relay_state === 1);
    if (this.lastState.relayOn !== relayOn) {
      this.lastState.relayOn = relayOn;
      if (relayOn) {
        this.emit('power-on', this);
      } else {
        this.emit('power-off', this);
      }
    }
  }

  get (command) {
    return new Promise((resolve, reject) => {
      var socket = this.send(command);
      socket.on('data', (data) => {
        data = decrypt(data.slice(4)).toString('ascii');
        data = JSON.parse(data);
        socket.end();
        if (!data.err_code || data.err_code === 0) {
          resolve(data);
        } else {
          let errMsg = data;
          console.error('HS100 Plug TCP error %j' + data);
          reject(new Error(errMsg));
        }
        resolve(data);
      }).on('timeout', () => {
        socket.end();
        let errMsg = 'HS100 Plug TCP timeout';
        console.error(errMsg);
        reject(new Error(errMsg));
      }).on('error', (err) => {
        console.error('HS100 Plug TCP error');
        console.trace(err);
        socket.end();
        reject(err);
      });
    });
  }

  set (command) {
    return this.get(command);
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

  getInfo () {
    return this.get(commands.info).then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      this.cloudInfo = data.cnCloud.get_info;
      this.consumption = data.emeter;
      this.scheduleNextAction = data.schedule.get_next_action;
      return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, consumption: this.consumption, scheduleNextAction: this.scheduleNextAction};
    });
  }

  getSysInfo () {
    return this.get(commands.getSysInfo).then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      return this.sysInfo;
    });
  }

  getCloudInfo () {
    return this.get(commands.getCloudInfo).then((data) => {
      this.cloudInfo = data.cnCloud.get_info;
      return this.cloudInfo;
    });
  }

  getScheduleNextAction () {
    return this.get(commands.getScheduleNextAction).then((data) => {
      return data.schedule.get_next_action;
    });
  }

  getScheduleRules () {
    return this.get(commands.getScheduleRules).then((data) => {
      return data.schedule.get_rules;
    });
  }

  getAwayRules () {
    return this.get(commands.getAwayRules).then((data) => {
      return data.anti_theft.get_rules;
    });
  }

  getTimerRules () {
    return this.get(commands.getTimerRules).then((data) => {
      return data.count_down.get_rules;
    });
  }

  getTime () {
    return this.get(commands.getTime).then((data) => {
      return data.time.get_time;
    });
  }

  getTimeZone () {
    return this.get(commands.getTimeZone).then((data) => {
      return data.time.get_timezone;
    });
  }

  getScanInfo (refresh, timeout) {
    refresh = refresh || false;
    timeout = timeout || 17;
    var cmd = commands.getScanInfo(refresh, timeout);
    return this.get(cmd).then((data) => {
      return data.netif.get_scaninfo;
    });
  }

  getModel () {
    return this.getSysInfo().then((sysInfo) => {
      return (sysInfo.model);
    });
  }

  getPowerState () {
    return this.getSysInfo().then((sysInfo) => {
      return (sysInfo.relay_state === 1);
    });
  }

  setPowerState (value) {
    var cmd = commands.setPowerState(value);
    return this.set(cmd).then((data) => {
      try {
        var errCode = data.system.set_relay_state.err_code;
        if (errCode === 0) { this.sysInfo.relay_state = (value ? 1 : 0); }
        this.emitEvents();
        return (errCode === 0);
      } catch (e) {}
      if (errCode !== 0) { throw data; }
    });
  }

  getLedState () {
    return this.getSysInfo().then((sysInfo) => {
      return (sysInfo.led_off === 0);
    });
  }

  setLedState (state) {
    var cmd = commands.setLedState(state);
    return this.set(cmd).then((data) => {
      try {
        var errCode = data.system.set_led_off.err_code;
        return (errCode === 0);
      } catch (e) {}
      if (errCode !== 0) { throw data; }
    });
  }

  getConsumption () {
    return this.get(commands.getConsumption).then((data) => {
      this.consumption = data.emeter.get_realtime;
      return this.consumption;
    });
  }

  send (payload) {
    var socket = net.connect(this.port, this.host);
    socket.setKeepAlive(false);
    socket.setTimeout(this.timeout);

    socket.on('connect', () => {
      socket.write(encryptWithHeader(payload));
    });
    socket.on('timeout', () => {
      socket.end();
    });
    socket.on('end', () => {
      socket.end();
    });

    return socket;
  }
}

module.exports = Plug;
