'use strict';

const net = require('net');

const encryptWithHeader = require('./utils').encryptWithHeader;
const decrypt = require('./utils').decrypt;

var commands = {
  search: '{"system":{"get_sysinfo":{}}}',

  info: '{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}}}',
  getInfo: '{"system":{"get_sysinfo":{}}}',
  getCloudInfo: '{"cnCloud":{"get_info":{}}}',

  getScheduleNextAction: '{"schedule":{"get_next_action":{}}}',
  getScheduleRules: '{"schedule":{"get_rules":{}}}',
  getAwayRules: '{"anti_theft":{"get_rules":{}}}',
  getTimerRules: '{"count_down":{"get_rules":{}}}',
  getConsumption: '{"emeter":{"get_realtime":{}}}',
  getTime: '{"time":{"get_time":{}}}',
  getTimeZone: '{"time":{"get_timezone":{}}}',
  getScanInfo: '{"netif":{"get_scaninfo":{"refresh":0,"timeout":17}}}',

  setPowerStateOn: '{"system":{"set_relay_state":{"state":1}}}',
  setPowerStateOff: '{"system":{"set_relay_state":{"state":0}}}'
};

class Plug {
  constructor (options) {
    if (typeof options === 'undefined') options = {};
    this.host = options.host;
    this.port = options.port || 9999;
    this.timeout = options.timeout || 3000;
  }

  get (command) {
    return new Promise((resolve, reject) => {
      var socket = this.send(command);
      socket.on('data', (data) => {
        data = decrypt(data.slice(4)).toString('ascii');
        data = JSON.parse(data);
        socket.end();
        resolve(data);
      }).on('timeout', () => {
        socket.end();
        reject('timeout');
      }).on('error', (err) => {
        socket.end();
        reject(err);
      });
    });
  }

  set (command) {
    return this.get(command);
  }

  getInfo () {
    return this.get(commands.getInfo).then((data) => {
      return data.system.get_sysinfo;
    });
  }

  getCloudInfo () {
    return this.get(commands.getCloudInfo).then((data) => {
      return data.cnCloud.get_info;
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

  getScanInfo () {
    return this.get(commands.getScanInfo).then((data) => {
      return data.netif.get_scaninfo;
    });
  }

  getModel () {
    return this.getInfo().then((sysInfo) => {
      return (sysInfo.model);
    });
  }

  getPowerState () {
    return this.getInfo().then((sysInfo) => {
      return (sysInfo.relay_state === 1);
    });
  }

  setPowerState (value) {
    var cmd = (value ? commands.setPowerStateOn : commands.setPowerStateOff);
    return this.set(cmd).then((data) => {
      try {
        var errCode = data.system.set_relay_state.err_code;
        return (errCode === 0);
      } catch (e) {}
      if (errCode !== 0) { throw data; }
    });
  }

  getConsumption () {
    return this.get(commands.getConsumption).then((data) => {
      return data.emeter;
    });
  }

  send (payload) {
    var socket = net.connect(this.port, this.host);
    socket.setKeepAlive(false);
    socket.setTimeout(this.timeout);

    socket.on('connect', () => {
      socket.write(encryptWithHeader(payload));
    });
    socket.on('end', () => {
      socket.end();
    });

    return socket;
  }
}

module.exports = Plug;
