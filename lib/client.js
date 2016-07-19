'use strict';

const dgram = require('dgram');

const Plug = require('./plug');
const encrypt = require('./utils').encrypt;
const decrypt = require('./utils').decrypt;

var commands = {
  search: '{"system":{"get_sysinfo":{}}}'
};

class Client {

  constructor (options) {
    if (typeof options === 'undefined') options = {};
    this.broadcast = options.broadcast || '255.255.255.255';
  }

  getPlug (options) {
    return new Plug(options);
  }

  search (timeout, maxSearchCount) {
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
        sysinfo.host = rinfo.address;
        sysinfo.port = rinfo.port;
        responses.set(sysinfo.deviceId, sysinfo);
        if (maxSearchCount > 0 && responses >= maxSearchCount) {
          socket.close();
          resolve(Array.from(responses.values()));
        }
      });

      socket.bind();

      var msgBuf = encrypt(commands.search);
      socket.send(msgBuf, 0, msgBuf.length, 9999, this.broadcast);

      setTimeout(() => {
        socket.close();
        resolve(Array.from(responses.values()));
      }, timeout);
    });
  }
}

module.exports = Client;
