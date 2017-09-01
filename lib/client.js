'use strict';

const dgram = require('dgram');
const EventEmitter = require('events');

const Device = require('./device');
const Plug = require('./plug');
const Bulb = require('./bulb');

const encrypt = require('./utils').encrypt;
const decrypt = require('./utils').decrypt;

class Client extends EventEmitter {
  constructor (options) {
    super();
    if (typeof options === 'undefined') options = {};
    this.debug = options.debug || false;

    this.devices = new Map();
    this.discoveryTimer = null;
    this.discoveryPacketSequence = 0;
  }

  getGeneralDevice (options) {
    return new Device(options);
  }

  getPlug (options) {
    return new Plug(options);
  }

  getBulb (options) {
    return new Bulb(options);
  }

  getDevice (options) {
    return Device.getSysInfo(options).then((sysInfo) => {
      return this.getDeviceFromSysInfo(sysInfo, options);
    });
  }

  getDeviceFromSysInfo (sysInfo, options) {
    const deviceType = sysInfo.type || sysInfo.mic_type;
    switch (deviceType) {
      case 'IOT.SMARTPLUGSWITCH': return new Plug(options);
      case 'IOT.SMARTBULB': return new Bulb(options);
      default: return new Plug(options);
    }
  }

  startDiscovery ({address, port, broadcast = '255.255.255.255', discoveryInterval = 10000, discoveryTimeout = 0, offlineTolerance = 3, deviceTypes, devices} = {}) {
    this.socket = dgram.createSocket('udp4');

    this.socket.on('error', (err) => {
      this.isSocketBound = false;
      console.error('TPLink Client UDP error');
      console.trace(err);
      this.socket.close();
      this.emit('error', err);
    });

    this.socket.on('message', (msg, rinfo) => {
      const decryptedMsg = decrypt(msg).toString('ascii');

      if (this.debug) {
        console.log('DEBUG - ' + decryptedMsg.toString('ascii') + ' from ' + rinfo.address);
      }

      let parsedMsg;
      try {
        parsedMsg = JSON.parse(decryptedMsg);
      } catch (e) {
        console.error('Error parsing JSON - Original: [%s] Decrypted: [%s] From: [%s]', msg, decryptedMsg, rinfo.address);
        return;
      }

      const jsonMsg = parsedMsg;

      const sysInfo = jsonMsg.system.get_sysinfo;

      const deviceType = sysInfo.type || sysInfo.mic_type;

      if (deviceTypes && !deviceTypes.includes(deviceType)) {
        if (this.debug) {
          console.log('Filtered out: %s (%s), allowed device types: (%j)', sysInfo.alias, deviceType, deviceTypes);
        }
        return;
      }

      if (this.devices.has(sysInfo.deviceId)) {
        const device = this.devices.get(sysInfo.deviceId);
        device.host = rinfo.address;
        device.port = rinfo.port;
        device.sysInfo = sysInfo;
        device.status = 'online';
        device.seenOnDiscovery = this.discoveryPacketSequence;
        this.emit('device-online', device);
      } else {
        var deviceOptions = Object.assign({}, this.options, {client: this, deviceId: sysInfo.deviceId, host: rinfo.address, port: rinfo.port, seenOnDiscovery: this.discoveryPacketSequence, debug: this.debug});
        const device = this.getDeviceFromSysInfo(sysInfo, deviceOptions);
        device.sysInfo = sysInfo;
        device.status = 'online';
        this.devices.set(device.deviceId, device);
        this.emit('device-new', device);
      }
    });

    this.socket.bind(port, address, () => {
      this.socket.setBroadcast(true);
    });

    this.discoveryTimer = setInterval(() => {
      this.sendDiscovery(broadcast, devices, offlineTolerance);
    }, discoveryInterval);

    if (discoveryTimeout > 0) {
      setTimeout(() => {
        this.stopDiscovery();
      }, discoveryTimeout);
    }

    return this.sendDiscovery(broadcast, devices, offlineTolerance);
  }

  stopDiscovery () {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
      this.socket.close();
    }
  }

  sendDiscovery (address, devices, offlineTolerance) {
    devices = devices || [];

    this.devices.forEach((device) => {
      if (device.status !== 'offline') {
        var diff = this.discoveryPacketSequence - device.seenOnDiscovery;
        if (diff >= offlineTolerance) {
          device.status = 'offline';
          this.emit('device-offline', device);
        }
      }
    });

    let msgBuf = encrypt('{"system":{"get_sysinfo":{}}}');
    this.socket.send(msgBuf, 0, msgBuf.length, 9999, address);

    devices.forEach((d) => {
      this.socket.send(msgBuf, 0, msgBuf.length, d.port || 9999, d.host);
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
