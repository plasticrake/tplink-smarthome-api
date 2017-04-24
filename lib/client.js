'use strict';

const dgram = require('dgram');
const EventEmitter = require('events');

const Plug = require('./plug');
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
    this.offlineTolerance = options.offlineTolerance || 3;
    this.filter = options.filter || 'IOT.SMARTPLUGSWITCH';
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

      const jsonMsg = JSON.parse(decryptedMsg);
      const sysInfo = jsonMsg.system.get_sysinfo;
      const consumption = jsonMsg.emeter.get_realtime;

      const deviceType = sysInfo.type || sysInfo.mic_type;

      if (this.typeFilter && deviceType !== this.typeFilter) {
        if (this.debug) {
          console.log('Filtered out: %s (%s)', sysInfo.alias, deviceType);
        }
        return;
      }

      if (this.devices.has(sysInfo.deviceId)) {
        const plug = this.devices.get(sysInfo.deviceId);
        plug.consumption = consumption;
        plug.sysInfo = sysInfo;
        plug.status = 'online';
        plug.seenOnDiscovery = this.discoveryPacketSequence;
        this.emit('plug-online', plug);
      } else {
        var plugOptions = Object.assign({}, this.options, {client: this, deviceId: sysInfo.deviceId, host: rinfo.address, port: rinfo.port, seenOnDiscovery: this.discoveryPacketSequence});
        const plug = new Plug(plugOptions);
        plug.consumption = consumption;
        plug.sysInfo = sysInfo;
        plug.status = 'online';
        this.devices.set(plug.deviceId, plug);
        this.emit('plug-new', plug);
      }
    }.bind(this));

    this.socket.bind(this.port, this.address, () => {
      this.socket.setBroadcast(true);
    });
  }

  getPlug (options) {
    return new Plug(options);
  }

  startDiscovery (devices) {
    this.discoveryTimer = setInterval(() => {
      this.sendDiscovery(devices);
    }, this.discoveryInterval);

    return this.sendDiscovery(devices);
  }

  stopDiscovery () {
    clearInterval(this.discoveryTimer);
    this.discoveryTimer = null;
  }

  sendDiscovery (devices) {
    devices = devices || [];

    this.devices.forEach((device) => {
      if (device.status !== 'offline') {
        var diff = this.discoveryPacketSequence - device.seenOnDiscovery;
        if (diff >= this.offlineTolerance) {
          device.status = 'offline';
          this.emit('plug-offline', device);
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
