'use strict';

const net = require('net');
const dgram = require('dgram');
const util = require('util');
const encryptWithHeader = require('./utils').encryptWithHeader;
const encrypt = require('./utils').encrypt;
const decrypt = require('./utils').decrypt;

module.exports = Hs100Api;

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
  getDailyStatisticsForMonth: '{"emeter":{"get_daystat":{"month":%d,"year":%d}}}',
  getMonthlyStatisticsForYear: '{"emeter":{"get_monthstat":{"year": %d}}}',
  getTime: '{"time":{"get_time":{}}}',
  getTimeZone: '{"time":{"get_timezone":{}}}',
  getScanInfo: '{"netif":{"get_scaninfo":{"refresh":0,"timeout":17}}}',

  setPowerStateOn: '{"system":{"set_relay_state":{"state":1}}}',
  setPowerStateOff: '{"system":{"set_relay_state":{"state":0}}}'
};

function Hs100Api (config) {
  if (typeof config === 'undefined') config = {};
  this.host = config.host;
  this.port = config.port || 9999;
}

Hs100Api.prototype.search = function (timeout, maxSearchCount) {
  if (typeof timeout === 'undefined') timeout = 3000;
  if (typeof maxSearchCount === 'undefined') maxSearchCount = 0;

  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');

    var responses = new Map();

    socket.on('error', (err) => {
      console.log(`server error:\n${err.stack}`);
      socket.close();
      reject(err);
    });

    socket.on('listening', () => {
      socket.setBroadcast(true);
    });

    socket.on('message', (msg, rinfo) => {
      const decryptedMsg = decrypt(msg).toString('ascii');
      const jsonMsg = JSON.parse(decryptedMsg);
      const sysinfo = jsonMsg.system.get_sysinfo;
      responses.set(sysinfo.deviceId, sysinfo);
      if (maxSearchCount > 0 && responses >= maxSearchCount) {
        socket.close();
        resolve(Array.from(responses.values()));
      }
    });

    socket.on('close', (msg, rinfo) => {
      console.log('close');
    });

    socket.bind();

    var msgBuf = encrypt(commands.search);
    socket.send(msgBuf, 0, msgBuf.length, 9999, '255.255.255.255');

    setTimeout(() => {
      socket.close();
      resolve(Array.from(responses.values()));
    }, timeout);
  });
};

Hs100Api.prototype.get = function (command) {
  return new Promise((resolve, reject) => {
    var socket = this.send(command);
    socket.on('data', (data) => {
      data = decrypt(data.slice(4)).toString('ascii');
      data = JSON.parse(data);
      socket.end();
      resolve(data);
    }).on('error', (err) => {
      socket.end();
      reject(err);
    });
  });
};

Hs100Api.prototype.set = function (command) {
  return this.get(command);
};

Hs100Api.prototype.getInfo = function () {
  return this.get(commands.getInfo).then((data) => {
    return data.system.get_sysinfo;
  });
};

Hs100Api.prototype.getCloudInfo = function () {
  return this.get(commands.getCloudInfo).then((data) => {
    return data.cnCloud.get_info;
  });
};

Hs100Api.prototype.getScheduleNextAction = function () {
  return this.get(commands.getScheduleNextAction).then((data) => {
    return data.schedule.get_next_action;
  });
};

Hs100Api.prototype.getScheduleRules = function () {
  return this.get(commands.getScheduleRules).then((data) => {
    return data.schedule.get_rules;
  });
};

Hs100Api.prototype.getAwayRules = function () {
  return this.get(commands.getAwayRules).then((data) => {
    return data.anti_theft.get_rules;
  });
};

Hs100Api.prototype.getTimerRules = function () {
  return this.get(commands.getTimerRules).then((data) => {
    return data.count_down.get_rules;
  });
};

Hs100Api.prototype.getTime = function () {
  return this.get(commands.getTime).then((data) => {
    return data.time.get_time;
  });
};

Hs100Api.prototype.getTimeZone = function () {
  return this.get(commands.getTimeZone).then((data) => {
    return data.time.get_timezone;
  });
};

Hs100Api.prototype.getScanInfo = function () {
  return this.get(commands.getScanInfo).then((data) => {
    return data.netif.get_scaninfo;
  });
};

Hs100Api.prototype.getModel = function () {
  return this.getInfo().then((sysInfo) => {
    return (sysInfo.model);
  });
};

Hs100Api.prototype.getPowerState = function () {
  return this.getInfo().then((sysInfo) => {
    return (sysInfo.relay_state === 1);
  });
};

Hs100Api.prototype.setPowerState = function (value) {
  var cmd = (value ? commands.setPowerStateOn : commands.setPowerStateOff);
  return this.set(cmd).then((data) => {
    try {
      var errCode = data.system.set_relay_state.err_code;
      return (errCode === 0);
    } catch (e) {}
    if (errCode !== 0) { throw data; }
  });
};

Hs100Api.prototype.getConsumption = function () {
  return this.get(commands.getConsumption).then((data) => {
    return data.emeter;
  });
};

/**
 * Get Daily Statistic for the given month of the given year
 * @param number [month] the number of month
 * @param number [year] the full year, e.g. 2016
 * @returns {Promise.<T>}
 */
Hs100Api.prototype.getDailyStatisticsForMonth = function (month, year) {
  var d = new Date();
  if (typeof month === 'undefined') month = d.getMonth() + 1;
  if (typeof year === 'undefined') year = d.getFullYear();
  return this.get(util.format(commands.getDailyStatisticsForMonth, month, year)).then((data) => {
        return data.emeter;
  });
};

/**
 * Get Monthly Statistic for given year
 * @param number [year] the full year, e.g. 2016
 * @returns {Promise.<T>}
 */
Hs100Api.prototype.getMonthlyStatisticsForYear = function (year) {
  if (typeof year === 'undefined') {
    var d = new Date();
    year = d.getFullYear();
  }
  return this.get(util.format(commands.getMonthlyStatisticsForYear, year)).then((data) => {
        return data.emeter;
  });
};

Hs100Api.prototype.send = function (payload) {
  var socket = net.connect(this.port, this.host);
  socket.setKeepAlive(false);

  socket.on('connect', () => {
    socket.write(encryptWithHeader(payload));
  });
  socket.on('timeout', () => {
    socket.end();
  });
  socket.on('end', () => {
    socket.end();
  });
  socket.on('error', () => {
    socket.end();
  });

  return socket;
};
