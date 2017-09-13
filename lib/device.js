'use strict';

const EventEmitter = require('events');

class Device extends EventEmitter {
  constructor (options) {
    super();
    if (typeof options === 'undefined') options = {};

    this.client = options.client;
    this.log = options.logger || this.client.log;
    this.log.debug('device.constructor(%j)', Object.assign({}, options, {client: 'not shown'}));

    this.deviceId = options.deviceId;
    this.host = options.host;
    this.port = options.port || 9999;
    this.seenOnDiscovery = options.seenOnDiscovery || null;
    this.timeout = options.timeout || this.client.timeout || 5000;

    this.name = this.deviceId || this.host; // Overwritten by alias later
    this.model = null;
    this.type = null;

    this.lastState = {};

    this._sysInfo = {};
    this._consumption = {};

    if (options.sysInfo) { this.sysInfo = options.sysInfo; }

    if (options.memoize) { this.memoize(options.memoize); }
  }

  memoize (maxAge = 5000) {
    this.log.debug('[%s] device.memoize(%d)', this.name, maxAge);
    const memoize = require('memoizee');
    this.getSysInfo = memoize(this.getSysInfo.bind(this), { promise: true, maxAge: maxAge, length: 0 });
    this.getModel = memoize(this.getModel.bind(this), { promise: true, maxAge: maxAge, length: 0 });
  }

  send (payload, timeout = null) {
    timeout = (timeout == null ? this.timeout : timeout);
    this.log.debug('[%s] device.send()', this.name);
    return this.client.send({host: this.host, port: this.port, payload, timeout})
      .catch((reason) => {
        this.log.error('[%s] device.send() %s', this.name, reason);
        this.log.debug(payload);
        throw reason;
      });
  }

  getSysInfo ({timeout} = {}) {
    this.log.debug('[%s] device.getSysInfo()', this.name);
    return this.send('{"system":{"get_sysinfo":{}}}', timeout).then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      return this.sysInfo;
    });
  }

  get sysInfo () {
    return this._sysInfo;
  }

  set sysInfo (sysInfo) {
    this.log.debug('[%s] device sysInfo set', (sysInfo.alias || this.name));
    this._sysInfo = sysInfo;
    this.name = sysInfo.alias;
    this.deviceId = sysInfo.deviceId;
    this.deviceName = sysInfo.dev_name;
    this.model = sysInfo.model;
    this.type = sysInfo.type || sysInfo.mic_type;
    this.softwareVersion = sysInfo.sw_ver;
    this.hardwareVersion = sysInfo.hw_ver;
    this.mac = sysInfo.mac;
    try {
      this.supportsConsumption = (sysInfo.feature.includes('ENE'));
    } catch (e) {
      this.supportsConsumption = false;
    }
  }

  get type () {
    return this._type;
  }

  set type (type) {
    switch (type) {
      case 'IOT.SMARTPLUGSWITCH':
      case 'plug':
        type = 'plug';
        break;
      case 'IOT.SMARTBULB':
      case 'bulb':
        type = 'bulb';
        break;
      default:
        type = 'device';
        break;
    }
    this._type = type;
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
