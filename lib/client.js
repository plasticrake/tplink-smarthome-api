'use strict';

const dgram = require('dgram');
const net = require('net');
const EventEmitter = require('events');

const Device = require('./device');
const Plug = require('./plug');
const Bulb = require('./bulb');

const encryptWithHeader = require('./utils').encryptWithHeader;
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

  send ({host, port = 9999, payload, timeout = 3000, debug = false}) {
    if (debug) { console.log('DEBUG: Device send'); }
    return new Promise((resolve, reject) => {
      let payloadString = (!(typeof payload === 'string' || payload instanceof String) ? JSON.stringify(payload) : payload);

      if (debug) { console.log('DEBUG: device socket: attempting to open. host:%s, port:%s', host, port); }
      let socket = net.connect(port, host);
      socket.setKeepAlive(false);
      if (timeout > 0) { socket.setTimeout(timeout); }

      let deviceData = '';

      if (timeout > 0) {
        setTimeout(() => {
          socket.end();
          reject(new Error('send timeout'));
        }, timeout);
      }

      socket.on('connect', () => {
        if (debug) { console.log('DEBUG: device socket: connect'); }
        socket.write(encryptWithHeader(payloadString));
      });

      socket.on('data', (data) => {
        if (debug) { console.log('DEBUG: device socket: data'); }
        deviceData += decrypt(data.slice(4)).toString('ascii');
        socket.end();
      });

      socket.on('end', () => {
        if (debug) { console.log('DEBUG: device socket: end'); }
        socket.destroy();
        let data;
        try {
          data = JSON.parse(deviceData);
        } catch (e) {
          data = deviceData;
        }
        if (!data.err_code || data.err_code === 0) {
          resolve(data);
        } else {
          let errMsg = data;
          console.error('TPLink Device response error %j' + data);
          reject(new Error(errMsg));
        }
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
        socket.destroy();
        reject(err);
      });

      return socket;
    });
  }

  getSysInfo ({host, port, timeout, debug}) {
    return this.send({host, port, payload: '{"system":{"get_sysinfo":{}}}', timeout, debug}).then((data) => {
      return data.system.get_sysinfo;
    });
  }

  emit (eventName, ...args) {
    // Add device- / plug- / bulb- to eventName
    // console.log(eventName + ' ' + (args[0] ? args[0].type : ''));
    if (args[0] instanceof Device) {
      super.emit('device-' + eventName, ...args);
      if (args[0].type !== 'device') {
        super.emit(args[0].type + '-' + eventName, ...args);
      }
    } else {
      super.emit(eventName, ...args);
    }
  }

  getGeneralDevice (options) {
    options = Object.assign(options, {client: this});
    return new Device(options);
  }

  getPlug (options) {
    options = Object.assign(options, {client: this});
    return new Plug(options);
  }

  getBulb (options) {
    options = Object.assign(options, {client: this});
    return new Bulb(options);
  }

  getDevice (options) {
    options = Object.assign(options, {client: this});
    return this.getSysInfo(options).then((sysInfo) => {
      return this.getDeviceFromSysInfo(sysInfo, options);
    });
  }

  getDeviceFromSysInfo (sysInfo, options) {
    options = Object.assign(options, {sysInfo});
    const deviceType = sysInfo.type || sysInfo.mic_type;
    switch (deviceType) {
      case 'IOT.SMARTPLUGSWITCH': return this.getPlug(options);
      case 'IOT.SMARTBULB': return this.getBulb(options);
      default: return this.getPlug(options);
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
        this.emit('online', device);
      } else {
        let deviceOptions = Object.assign({}, this.options, {client: this, deviceId: sysInfo.deviceId, host: rinfo.address, port: rinfo.port, seenOnDiscovery: this.discoveryPacketSequence, debug: this.debug});
        const device = this.getDeviceFromSysInfo(sysInfo, deviceOptions);
        device.sysInfo = sysInfo;
        device.status = 'online';
        this.devices.set(device.deviceId, device);
        this.emit('new', device);
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
        let diff = this.discoveryPacketSequence - device.seenOnDiscovery;
        if (diff >= offlineTolerance) {
          device.status = 'offline';
          this.emit('offline', device);
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
