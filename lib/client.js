'use strict';

const dgram = require('dgram');
const EventEmitter = require('events');

const Device = require('./device');
const encrypt = require('./utils').encrypt;
const decrypt = require('./utils').decrypt;

const commands = {
  search: '{"emeter":{"get_realtime":{}},"system":{"get_sysinfo":{}}}'
};

class Client extends EventEmitter {
  constructor (options) {
    super();
    if (typeof options === 'undefined') options = {};
    this.address = options.address;
    this.port = options.port;
    this.broadcast = options.broadcast || '255.255.255.255';
    this.discoveryInterval = options.discoveryInterval || 10000;
    this.discoveryTimeout = options.discoveryTimeout || 0;
    this.offlineTolerance = options.offlineTolerance || 3;
    this.deviceTypes = options.deviceTypes || ['IOT.SMARTPLUGSWITCH'];
    this.debug = options.debug || false;

    this.devices = new Map();
    this.discoveryTimer = null;
    this.discoveryPacketSequence = 0;
    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', function (err) {
      this.isSocketBound = false;
      console.error('HS100 Client UDP error');
      console.trace(err);
      this.socket.close();
      this.emit('error', err);
    }.bind(this));

    this.socket.on('message', function (msg, rinfo) {
      // Ignore own messages and false formats
      // if (utils.getHostIPs().indexOf(rinfo.address) >= 0 || !Buffer.isBuffer(msg)) {
      //   return
      // }

      const decryptedMsg = decrypt(msg).toString('ascii');

      if (this.debug) {
        console.log('DEBUG - ' + decryptedMsg.toString('ascii') + ' from ' + rinfo.address);
      }

      var parsedMsg;
      try {
        parsedMsg = JSON.parse(decryptedMsg);
      } catch (e) {
        console.error('Error parsing JSON - Original: [%s] Decrypted: [%s] From: [%s]', msg, decryptedMsg, rinfo.address);
        return;
      }

      const jsonMsg = parsedMsg;

      const sysInfo = jsonMsg.system.get_sysinfo;
      const consumption = jsonMsg.emeter.get_realtime;

      const deviceType = sysInfo.type || sysInfo.mic_type;

      if (this.deviceTypes && !this.deviceTypes.includes(deviceType)) {
        if (this.debug) {
          console.log('Filtered out: %s (%s), allowed device types: (%j)', sysInfo.alias, deviceType, this.deviceTypes);
        }
        return;
      }

      if (this.devices.has(sysInfo.deviceId)) {
        const device = this.devices.get(sysInfo.deviceId);
        device.host = rinfo.address;
        device.port = rinfo.port;
        device.consumption = consumption;
        device.sysInfo = sysInfo;
        device.status = 'online';
        device.seenOnDiscovery = this.discoveryPacketSequence;
        this.emit('device-online', device);
      } else {
        var deviceOptions = Object.assign({}, this.options, {client: this, deviceId: sysInfo.deviceId, host: rinfo.address, port: rinfo.port, seenOnDiscovery: this.discoveryPacketSequence, debug: this.debug});
        const device = new Device(deviceOptions);
        device.consumption = consumption;
        device.sysInfo = sysInfo;
        device.status = 'online';
        this.devices.set(device.deviceId, device);
        this.emit('device-new', device);
      }
    }.bind(this));

    this.socket.bind(this.port, this.address, () => {
      this.socket.setBroadcast(true);
    });
  }

  getDevice (options) {
    return new Device(options);
  }

  startDiscovery (discoveryInterval = this.discoveryInterval, discoveryTimeout = this.discoveryTimeout, devices) {
    this.discoveryTimer = setInterval(() => {
      this.sendDiscovery(devices);
    }, discoveryInterval);

    if (discoveryTimeout > 0) {
      setTimeout(() => {
        this.stopDiscovery();
      }, discoveryTimeout);
    }

    return this.sendDiscovery(devices);
  }

  stopDiscovery () {
    clearInterval(this.discoveryTimer);
    this.discoveryTimer = null;
    this.socket.close();
  }

  sendDiscovery (timeout = 10000, devices) {
    devices = devices || [];

    this.devices.forEach((device) => {
      if (device.status !== 'offline') {
        var diff = this.discoveryPacketSequence - device.seenOnDiscovery;
        if (diff >= this.offlineTolerance) {
          device.status = 'offline';
          this.emit('device-offline', device);
        }
      }
    });

    var msgBuf = encrypt(commands.search);
    this.socket.send(msgBuf, 0, msgBuf.length, 9999, this.broadcast);

    devices.forEach((d) => {
      this.socket.send(msgBuf, 0, msgBuf.length, d.port, d.host);
    });

    if (this.discoveryPacketSequence >= Number.MAX_VALUE) {
      this.discoveryPacketSequence = 0;
    } else {
      this.discoveryPacketSequence += 1;
    }

    return this;
  }
}

module.exports = Client;
