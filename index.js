'use strict';

var net = require('net');
var encryptWithHeader = require('./utils').encryptWithHeader;
var decrypt = require('./utils').decrypt;

module.exports = Hs100Api;

var commands = {
  setPowerStateOn: '{"system":{"set_relay_state":{"state":1}}}',
  setPowerStateOff: '{"system":{"set_relay_state":{"state":0}}}',
  getSysInfo: '{ "system":{ "get_sysinfo":null } }',
  getConsumption: '{ "emeter":{ "get_realtime":null } }'
};

function Hs100Api (config) {
  if (typeof config === 'undefined') config = {};
  this.host = config.host;
  this.port = config.port || 9999;
}

Hs100Api.prototype.getPowerState = function () {
  return this.getSysInfo().then((sysInfo) => {
    return (sysInfo.relay_state === 1);
  });
};

Hs100Api.prototype.setPowerState = function (value) {
  return new Promise((resolve, reject) => {
    var cmd = (value ? commands.setPowerStateOn : commands.setPowerStateOff);
    var socket = this.send(cmd);
    socket.on('data', () => {
      socket.end();
      resolve();
    }).on('error', (err) => {
      socket.end();
      reject(err);
    });
  });
};

Hs100Api.prototype.getSysInfo = function () {
  return new Promise((resolve, reject) => {
    var socket = this.send(commands.getSysInfo);
    socket.on('data', (data) => {
      data = decrypt(data).toString('ascii');
      data = JSON.parse(data);
      socket.end();
      resolve(data.system.get_sysinfo);
    }).on('error', (err) => {
      socket.end();
      reject(err);
    });
  });
};

Hs100Api.prototype.getConsumption = function () {
  return new Promise((resolve, reject) => {
    var socket = this.send(commands.getConsumption);
    socket.on('data', (data) => {
      data = decrypt(data).toString('ascii');
      data = JSON.parse(data);
      socket.end();
      resolve(data);
    }).on('error', (err) => {
      socket.end();
      reject(err);
    });
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
