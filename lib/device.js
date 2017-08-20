'use strict';

const net = require('net');
const EventEmitter = require('events');

const encryptWithHeader = require('./utils').encryptWithHeader;
const decrypt = require('./utils').decrypt;

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
    // this.lastState = { powerOn: null, inUse: null };

    this.inUseThreshold = options.inUseThreshold || 0;

    this._sysInfo = {};
    this._consumption = {};
  }

  static send ({host, port = 9999, payload, timeout = 3000, debug = false}) {
    if (debug) { console.log('DEBUG: Device send'); }
    return new Promise((resolve, reject) => {
      let payloadString = (!(typeof payload === 'string' || payload instanceof String) ? JSON.stringify(payload) : payload);

      if (debug) { console.log('DEBUG: device socket: attempting to open. host:%s, port:%s', host, port); }
      let socket = net.connect(port, host);
      socket.setKeepAlive(false);
      if (timeout > 0) { socket.setTimeout(timeout); }

      let deviceData;

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
        deviceData = decrypt(data.slice(4)).toString('ascii');
        socket.end();
      });

      socket.on('end', () => {
        if (debug) { console.log('DEBUG: device socket: end'); }
        socket.destroy();
        let data = JSON.parse(deviceData);
        if (!data.err_code || data.err_code === 0) {
          resolve(data);
        } else {
          let errMsg = data;
          console.error('TPLink Device response error %j' + data);
          reject(new Error(errMsg));
        }
        resolve(data);
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

  static getSysInfo ({host, port, timeout, debug}) {
    return Device.send({host, port, payload: '{"system":{"get_sysinfo":{}}}', timeout, debug}).then((data) => {
      return data.system.get_sysinfo;
    });
  }

  send (payload, timeout = 0) {
    if (this.debug) { console.log('DEBUG: device send'); }
    return Device.send({host: this.host, port: this.port, payload, timeout, debug: this.debug});
  }

  getSysInfo ({timeout} = {}) {
    return this.send('{"system":{"get_sysinfo":{}}}', timeout).then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      return this.sysInfo;
    });
  }

  get sysInfo () {
    if (this.debug) { console.log('DEBUG: device get sysInfo()'); }
    return this._sysInfo;
  }

  set sysInfo (sysInfo) {
    if (this.debug) { console.log('DEBUG: device set sysInfo()'); }
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

  emitEvents () {
    if (this.debug) { console.log('DEBUG: device emitEvents()'); }
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

  getModel () {
    return this.getSysInfo().then((sysInfo) => {
      return (sysInfo.model);
    });
  }
}

module.exports = Device;
