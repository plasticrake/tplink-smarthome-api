'use strict';

const net = require('net');
const EventEmitter = require('events');

const encryptWithHeader = require('./utils').encryptWithHeader;
const decrypt = require('./utils').decrypt;

var commands = {
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

class Device extends EventEmitter {
  constructor (options) {
    super();
    if (typeof options === 'undefined') options = {};
    this.client = options.client;
    this.deviceId = options.deviceId;
    this.host = options.host;
    this.port = options.port || 9999;
    this.seenOnDiscovery = options.seenOnDiscovery || null;
    this.timeout = options.timeout || 5000;
    this.debug = options.debug || false;

    this.model = null;
    this.type = null;
    this.lastState = { powerOn: null, inUse: null };

    this.inUseThreshold = options.inUseThreshold || 0;

    this._sysInfo = {};
    this._consumption = {};
  }

  get sysInfo () { return this._sysInfo; }

  set sysInfo (sysInfo) {
    if (this.debug) { console.log('DEBUG: set sysInfo()'); }
    this._sysInfo = sysInfo;
    this.name = sysInfo.alias;
    this.deviceId = sysInfo.deviceId;
    this.deviceName = sysInfo.dev_name;
    this.model = sysInfo.model;
    this.type = sysInfo.type || sysInfo.mic_type;
    this.softwareVersion = sysInfo.sw_ver;
    this.hardwareVersion = sysInfo.hw_ver;
    this.mac = sysInfo.mac;
    this.latitude = sysInfo.latitude;
    this.longitude = sysInfo.longitude;
    try {
      this.supportsConsumption = (sysInfo.feature.includes('ENE'));
    } catch (e) {
      this.supportsConsumption = false;
    }
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
    if (this.supportsConsumption) {
      inUse = (this.consumption.power > this.inUseThreshold);
    } else {
      inUse = (this.sysInfo.relay_state === 1);
    }
    var powerOn = (this.sysInfo.relay_state === 1);

    if (this.debug) { console.log('DEBUG: emitEvents() inUse: %s powerOn: %s lastState: %j', inUse, powerOn, this.lastState); }

    if (this.lastState.inUse !== inUse) {
      this.lastState.inUse = inUse;
      if (inUse) {
        this.emit('in-use', this);
      } else {
        this.emit('not-in-use', this);
      }
    }

    if (this.lastState.powerOn !== powerOn) {
      this.lastState.powerOn = powerOn;
      if (powerOn) {
        this.emit('power-on', this);
      } else {
        this.emit('power-off', this);
      }
    }
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
    return this.send(commands.info).then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      this.cloudInfo = data.cnCloud.get_info;
      this.consumption = data.emeter;
      this.scheduleNextAction = data.schedule.get_next_action;
      return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, consumption: this.consumption, scheduleNextAction: this.scheduleNextAction};
    });
  }

  getSysInfo () {
    return this.send(commands.getSysInfo).then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      return this.sysInfo;
    });
  }

  getCloudInfo () {
    return this.send(commands.getCloudInfo).then((data) => {
      this.cloudInfo = data.cnCloud.get_info;
      return this.cloudInfo;
    });
  }

  getScheduleNextAction () {
    return this.send(commands.getScheduleNextAction).then((data) => {
      return data.schedule.get_next_action;
    });
  }

  getScheduleRules () {
    return this.send(commands.getScheduleRules).then((data) => {
      return data.schedule.get_rules;
    });
  }

  getAwayRules () {
    return this.send(commands.getAwayRules).then((data) => {
      return data.anti_theft.get_rules;
    });
  }

  getTimerRules () {
    return this.send(commands.getTimerRules).then((data) => {
      return data.count_down.get_rules;
    });
  }

  getTime () {
    return this.send(commands.getTime).then((data) => {
      return data.time.get_time;
    });
  }

  getTimeZone () {
    return this.send(commands.getTimeZone).then((data) => {
      return data.time.get_timezone;
    });
  }

  getScanInfo (refresh, timeout) {
    refresh = refresh || false;
    timeout = timeout || 17;
    var cmd = commands.getScanInfo(refresh, timeout);
    return this.send(cmd).then((data) => {
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
    return this.send(cmd).then((data) => {
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
    return this.send(cmd).then((data) => {
      try {
        var errCode = data.system.set_led_off.err_code;
        return (errCode === 0);
      } catch (e) {}
      if (errCode !== 0) { throw data; }
    });
  }

  getConsumption () {
    return this.send(commands.getConsumption).then((data) => {
      this.consumption = data.emeter.get_realtime;
      return this.consumption;
    });
  }

  send (payload, timeout = 0) {
    return new Promise((resolve, reject) => {
      let socket = net.connect(this.port, this.host);
      socket.setKeepAlive(false);
      socket.setTimeout(this.timeout);

      setTimeout(() => {
        socket.end();
        reject(new Error('send timeout'));
      }, timeout);

      socket.on('connect', () => {
        socket.write(encryptWithHeader(payload));
      });

      socket.on('data', (data) => {
        data = decrypt(data.slice(4)).toString('ascii');
        data = JSON.parse(data);
        socket.end();
        if (!data.err_code || data.err_code === 0) {
          resolve(data);
        } else {
          let errMsg = data;
          console.error('TPLink Device TCP error %j' + data);
          reject(new Error(errMsg));
        }
        resolve(data);
      });

      socket.on('end', () => {
        socket.end();
      });

      socket.on('timeout', () => {
        let errMsg = 'TPLink Device TCP timeout';
        console.error(errMsg);
        socket.end();
        reject(new Error(errMsg));
      });

      socket.on('error', (err) => {
        console.error('TPLink Device TCP error');
        console.trace(err);
        socket.destory();
        reject(err);
      });

      return socket;
    });
  }
}

module.exports = Device;
