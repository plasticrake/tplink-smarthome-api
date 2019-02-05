'use strict';

const dgram = require('dgram');
const EventEmitter = require('events');
const { encrypt, decrypt } = require('tplink-smarthome-crypto');

const Device = require('./device');
const Plug = require('./plug');
const Bulb = require('./bulb');
const TcpConnection = require('./network/tcp-connection');
const UdpConnection = require('./network/udp-connection');
const { compareMac } = require('./utils');

const discoveryMsgBuf = encrypt('{"system":{"get_sysinfo":{}},"emeter":{"get_realtime":{}},"smartlife.iot.common.emeter":{"get_realtime":{}}}');

/**
 * Send Options.
 *
 * @typedef {Object} SendOptions
 * @property {number} timeout         (ms)
 * @property {string} transport       'tcp','udp'
 * @property {boolean} useSharedSocket    attempt to reuse a shared socket if available, UDP only
 * @property {boolean} sharedSocketTimeout (ms) how long to wait for another send before closing a shared socket. 0 = never automatically close socket
 */

/**
 * Client that sends commands to specified devices or discover devices on the local subnet.
 * - Contains factory methods to create devices.
 * - Events are emitted after {@link #startDiscovery} is called.
 * @extends EventEmitter
 */
class Client extends EventEmitter {
  /**
   * @param  {Object}       options
   * @param  {SendOptions} [options.defaultSendOptions]
   * @param  {number}      [options.defaultSendOptions.timeout=10000]
   * @param  {string}      [options.defaultSendOptions.transport='tcp']
   * @param  {boolean}     [options.defaultSendOptions.useSharedSocket=false]
   * @param  {number}      [options.defaultSendOptions.sharedSocketTimeout=20000]
   * @param  {string}      [options.logLevel]       level for built in logger ['error','warn','info','debug','trace']
   */
  constructor ({ defaultSendOptions, logLevel, logger } = {}) {
    super();
    this.defaultSendOptions = Object.assign(
      {
        timeout: 10000,
        transport: 'tcp',
        useSharedSocket: false,
        sharedSocketTimeout: 20000
      }
      , defaultSendOptions);

    this.log = require('./logger')({ level: logLevel, logger: logger });

    this.devices = new Map();
    this.discoveryTimer = null;
    this.discoveryPacketSequence = 0;
    this.maxSocketId = 0;
  }

  /**
   * @private
   */
  getNextSocketId () {
    return this.maxSocketId++;
  }

  /**
   * {@link https://github.com/plasticrake/tplink-smarthome-crypto Encrypts} `payload` and sends to device.
   * - If `payload` is not a string, it is `JSON.stringify`'d.
   * - Promise fulfills with parsed JSON response.
   *
   * Devices use JSON to communicate.\
   * For Example:
   * - If a device receives:
   *   - `{"system":{"get_sysinfo":{}}}`
   * - It responds with:
   *   - `{"system":{"get_sysinfo":{
   *       err_code: 0,
   *       sw_ver: "1.0.8 Build 151113 Rel.24658",
   *       hw_ver: "1.0",
   *       ...
   *     }}}`
   *
   * All responses from device contain an `err_code` (`0` is success).
   *
   * @param  {Object|string}  payload
   * @param  {string}         host
   * @param  {number}        [port=9999]
   * @param  {SendOptions}   [sendOptions]
   * @return {Promise<Object, Error>}
   */
  async send (payload, host, port = 9999, sendOptions) {
    const thisSendOptions = Object.assign({}, this.defaultSendOptions, sendOptions, { useSharedSocket: false });
    const payloadString = (!(typeof payload === 'string' || payload instanceof String) ? JSON.stringify(payload) : payload);
    let connection;
    if (thisSendOptions.transport === 'udp') {
      connection = new UdpConnection({ host, port, log: this.log, client: this });
    } else {
      connection = new TcpConnection({ host, port, log: this.log, client: this });
    }
    const response = await connection.send(payloadString, thisSendOptions);
    connection.close();
    return response;
  }
  /**
   * Requests `{system:{get_sysinfo:{}}}` from device.
   *
   * @param  {string}       host
   * @param  {number}      [port=9999]
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async getSysInfo (host, port = 9999, sendOptions) {
    this.log.debug('client.getSysInfo(%j)', { host, port, sendOptions });
    const data = await this.send('{"system":{"get_sysinfo":{}}}', host, port, sendOptions);
    return data.system.get_sysinfo;
  }
  /**
   * @private
   */
  emit (eventName, ...args) {
    // Add device- / plug- / bulb- to eventName
    if (args[0] instanceof Device) {
      super.emit('device-' + eventName, ...args);
      if (args[0].deviceType !== 'device') {
        super.emit(args[0].deviceType + '-' + eventName, ...args);
      }
    } else {
      super.emit(eventName, ...args);
    }
  }
  /**
   * Creates Bulb object.
   *
   * See [Device constructor]{@link Device} and [Bulb constructor]{@link Bulb} for valid options.
   * @param  {Object} deviceOptions passed to [Bulb constructor]{@link Bulb}
   * @return {Bulb}
   */
  getBulb (deviceOptions) {
    return new Bulb(Object.assign({}, { defaultSendOptions: this.defaultSendOptions }, deviceOptions, { client: this }));
  }
  /**
   * Creates {@link Plug} object.
   *
   * See [Device constructor]{@link Device} and [Plug constructor]{@link Plug} for valid options.
   * @param  {Object} deviceOptions passed to [Plug constructor]{@link Plug}
   * @return {Plug}
   */
  getPlug (deviceOptions) {
    return new Plug(Object.assign({}, { defaultSendOptions: this.defaultSendOptions }, deviceOptions, { client: this }));
  }
  /**
   * Creates a {@link Plug} or {@link Bulb} after querying device to determine type.
   *
   * See [Device constructor]{@link Device}, [Bulb constructor]{@link Bulb}, [Plug constructor]{@link Plug} for valid options.
   * @param  {Object}      deviceOptions passed to [Device constructor]{@link Device}
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Plug|Bulb, Error>}
   */
  async getDevice (deviceOptions, sendOptions) {
    this.log.debug('client.getDevice(%j)', { deviceOptions, sendOptions });
    const sysInfo = await this.getSysInfo(deviceOptions.host, deviceOptions.port, sendOptions);
    return this.getDeviceFromSysInfo(sysInfo, Object.assign({}, deviceOptions, { client: this }));
  }
  /**
   * Create {@link Device} object.
   * - Device object only supports common Device methods.
   * - See [Device constructor]{@link Device} for valid options.
   * - Instead use {@link #getDevice} to create a fully featured object.
   * @param  {Object} deviceOptions passed to [Device constructor]{@link Device}
   * @return {Device}
   */
  getCommonDevice (deviceOptions) {
    return new Device(Object.assign({}, { client: this, defaultSendOptions: this.defaultSendOptions }, deviceOptions));
  }
  /**
   * @private
   */
  getDeviceFromType (typeName, deviceOptions) {
    if (typeof typeName === 'function') {
      typeName = typeName.name;
    }
    switch (typeName.toLowerCase()) {
      case 'plug': return this.getPlug(deviceOptions);
      case 'bulb': return this.getBulb(deviceOptions);
      default: return this.getPlug(deviceOptions);
    }
  }
  /**
   * Creates device corresponding to the provided `sysInfo`.
   *
   * See [Device constructor]{@link Device}, [Bulb constructor]{@link Bulb}, [Plug constructor]{@link Plug} for valid options
   * @param  {Object} sysInfo
   * @param  {Object} deviceOptions passed to device constructor
   * @return {Plug|Bulb}
   */
  getDeviceFromSysInfo (sysInfo, deviceOptions) {
    const thisDeviceOptions = Object.assign({}, deviceOptions, { sysInfo: sysInfo });
    switch (this.getTypeFromSysInfo(sysInfo)) {
      case 'plug': return this.getPlug(thisDeviceOptions);
      case 'bulb': return this.getBulb(thisDeviceOptions);
      default: return this.getPlug(thisDeviceOptions);
    }
  }
  /**
   * Guess the device type from provided `sysInfo`.
   *
   * Based on sys_info.[type|mic_type]
   * @param  {Object} sysInfo
   * @return {string}         'plug','bulb','device'
   */
  getTypeFromSysInfo (sysInfo) {
    const type = (sysInfo.type || sysInfo.mic_type || '');
    switch (true) {
      case (/plug/i).test(type): return 'plug';
      case (/bulb/i).test(type): return 'bulb';
      default: return 'device';
    }
  }
  /**
   * First response from device.
   * @event Client#device-new
   * @property {Device|Bulb|Plug}
   */
  /**
   * Follow up response from device.
   * @event Client#device-online
   * @property {Device|Bulb|Plug}
   */
  /**
   * No response from device.
   * @event Client#device-offline
   * @property {Device|Bulb|Plug}
   */
  /**
   * First response from Bulb.
   * @event Client#bulb-new
   * @property {Bulb}
   */
  /**
   * Follow up response from Bulb.
   * @event Client#bulb-online
   * @property {Bulb}
   */
  /**
   * No response from Bulb.
   * @event Client#bulb-offline
   * @property {Bulb}
   */
  /**
   * First response from Plug.
   * @event Client#plug-new
   * @property {Plug}
   */
  /**
   * Follow up response from Plug.
   * @event Client#plug-online
   * @property {Plug}
   */
  /**
   * No response from Plug.
   * @event Client#plug-offline
   * @property {Plug}
   */
  /**
   * Invalid/Unknown response from device.
   * @event Client#discovery-invalid
   * @property {Object} rinfo
   * @property {Buffer} response
   * @property {Buffer} decryptedResponse
   */
  /**
   * Error during discovery.
   * @event Client#error
   * @type {Object}
   * @property {Error}
   */
  /**
   * Discover TP-Link Smarthome devices on the network.
   *
   * - Sends a discovery packet (via UDP) to the `broadcast` address every `discoveryInterval`(ms).
   * - Stops discovery after `discoveryTimeout`(ms) (if `0`, runs until {@link #stopDiscovery} is called).
   *   - If a device does not respond after `offlineTolerance` number of attempts, {@link event:Client#device-offline} is emitted.
   * - If `deviceTypes` are specified only matching devices are found.
   * - If `macAddresses` are specified only devices with matching MAC addresses are found.
   * - If `excludeMacAddresses` are specified devices with matching MAC addresses are excluded.
   * - if `filterCallback` is specified only devices where the callback returns a truthy value are found.
   * - If `devices` are specified it will attempt to contact them directly in addition to sending to the broadcast address.
   *   - `devices` are specified as an array of `[{host, [port: 9999]}]`.
   * @param  {Object}    options
   * @param  {string}   [options.address]                     address to bind udp socket
   * @param  {number}   [options.port]                        port to bind udp socket
   * @param  {string}   [options.broadcast=255.255.255.255]   broadcast address
   * @param  {number}   [options.discoveryInterval=10000]     (ms)
   * @param  {number}   [options.discoveryTimeout=0]          (ms)
   * @param  {number}   [options.offlineTolerance=3]          # of consecutive missed replies to consider offline
   * @param  {string[]} [options.deviceTypes]                 'plug','bulb'
   * @param  {string[]} [options.macAddresses]                MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive, glob style *, and ? in pattern are supported
   * @param  {string[]} [options.excludeMacAddresses]         MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive, glob style *, and ? in pattern are supported
   * @param  {function} [options.filterCallback]              called with fn(sysInfo), return truthy value to include device
   * @param  {boolean}  [options.breakoutChildren=true]       if device has multiple outlets, create a separate plug for each outlet, otherwise create a plug for the main device
   * @param  {Object}   [options.deviceOptions={}]            passed to device constructors
   * @param  {Object[]} [options.devices]                     known devices to query instead of relying on broadcast
   * @return {Client}                                         this
   * @emits  Client#error
   * @emits  Client#device-new
   * @emits  Client#device-online
   * @emits  Client#device-offline
   * @emits  Client#bulb-new
   * @emits  Client#bulb-online
   * @emits  Client#bulb-offline
   * @emits  Client#plug-new
   * @emits  Client#plug-online
   * @emits  Client#plug-offline
   * @emits  Client#discovery-invalid
   */
  startDiscovery ({
    address,
    port,
    broadcast = '255.255.255.255',
    discoveryInterval = 10000,
    discoveryTimeout = 0,
    offlineTolerance = 3,
    deviceTypes,
    macAddresses = [],
    excludeMacAddresses = [],
    filterCallback,
    breakoutChildren = true,
    deviceOptions = {},
    devices
  } = {}) {
    this.log.debug('client.startDiscovery(%j)', arguments[0]);

    try {
      this.socket = dgram.createSocket('udp4');

      this.socket.on('message', (msg, rinfo) => {
        const decryptedMsg = decrypt(msg).toString('utf8');

        this.log.debug(`client.startDiscovery(): socket:message From: ${rinfo.address} ${rinfo.port} Message: ${decryptedMsg}`);

        let response;
        let sysInfo;
        let emeterRealtime;
        try {
          response = JSON.parse(decryptedMsg);
          sysInfo = response.system.get_sysinfo;
          emeterRealtime = parseEmeter(response);
        } catch (err) {
          this.log.debug(`client.startDiscovery(): Error parsing JSON: %s\nFrom: ${rinfo.address} ${rinfo.port} Original: [%s] Decrypted: [${decryptedMsg}]`, err, msg);
          this.emit('discovery-invalid', { rinfo, response: msg, decryptedResponse: decrypt(msg) });
          return;
        }

        if (deviceTypes && deviceTypes.length > 0) {
          const deviceType = this.getTypeFromSysInfo(sysInfo);
          if (deviceTypes.indexOf(deviceType) === -1) {
            this.log.debug(`client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}] (${deviceType}), allowed device types: (%j)`, deviceTypes);
            return;
          }
        }

        if (macAddresses && macAddresses.length > 0) {
          const mac = sysInfo.mac || sysInfo.mic_mac || sysInfo.ethernet_mac || '';
          if (!compareMac(mac, macAddresses)) {
            this.log.debug(`client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}] (${mac}), allowed macs: (%j)`, macAddresses);
            return;
          }
        }

        if (excludeMacAddresses && excludeMacAddresses.length > 0) {
          const mac = sysInfo.mac || sysInfo.mic_mac || sysInfo.ethernet_mac || '';
          if (compareMac(mac, excludeMacAddresses)) {
            this.log.debug(`client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}] (${mac}), excluded mac`);
            return;
          }
        }

        if (typeof filterCallback === 'function') {
          if (!filterCallback(sysInfo)) {
            this.log.debug(`client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}], callback`);
            return;
          }
        }

        this.createOrUpdateDeviceFromSysInfo({ sysInfo, emeterRealtime, host: rinfo.address, port: rinfo.port, breakoutChildren, options: deviceOptions });
      });

      this.socket.on('error', (err) => {
        this.log.error('client.startDiscovery: UDP Error: %s', err);
        this.stopDiscovery();
        this.emit('error', err);
      // TODO
      });

      this.socket.bind(port, address, () => {
        this.isSocketBound = true;
        const address = this.socket.address();
        this.log.debug(`client.socket: UDP ${address.family} listening on ${address.address}:${address.port}`);
        this.socket.setBroadcast(true);

        this.discoveryTimer = setInterval(() => {
          this.sendDiscovery(broadcast, devices, offlineTolerance);
        }, discoveryInterval);

        this.sendDiscovery(broadcast, devices, offlineTolerance);
        if (discoveryTimeout > 0) {
          setTimeout(() => {
            this.log.debug('client.startDiscovery: discoveryTimeout reached, stopping discovery');
            this.stopDiscovery();
          }, discoveryTimeout);
        }
      });
    } catch (err) {
      this.log.error('client.startDiscovery: %s', err);
      this.emit('error', err);
    }

    return this;
  }
  /**
   * @private
   */
  createOrUpdateDeviceFromSysInfo ({ sysInfo, emeterRealtime, host, port, options, breakoutChildren }) {
    const process = (id, childId) => {
      let device;
      if (this.devices.has(id)) {
        device = this.devices.get(id);
        device.host = host;
        device.port = port;
        device.sysInfo = sysInfo;
        device.status = 'online';
        device.seenOnDiscovery = this.discoveryPacketSequence;
        if (device.emeter) device.emeter.realtime = emeterRealtime;
        this.emit('online', device);
      } else {
        const deviceOptions = Object.assign({}, options, { client: this, host, port, childId });
        device = this.getDeviceFromSysInfo(sysInfo, deviceOptions);
        device.status = 'online';
        device.seenOnDiscovery = this.discoveryPacketSequence;
        if (device.emeter) device.emeter.realtime = emeterRealtime;
        this.devices.set(id, device);
        this.emit('new', device);
      }
    };

    if (breakoutChildren && sysInfo.children && sysInfo.children.length > 0) {
      sysInfo.children.forEach((child) => {
        const childId = (child.id.length === 2 ? sysInfo.deviceId + child.id : child.id);
        process(childId, childId);
      });
    } else {
      process(sysInfo.deviceId);
    }
  }
  /**
   * Stops discovery and closes UDP socket.
   */
  stopDiscovery () {
    this.log.debug('client.stopDiscovery()');
    clearInterval(this.discoveryTimer);
    this.discoveryTimer = null;
    if (this.isSocketBound) {
      this.isSocketBound = false;
      this.socket.close();
    }
  }
  /**
   * @private
   */
  sendDiscovery (address, devices, offlineTolerance) {
    this.log.debug('client.sendDiscovery(%s, %j, %s)', arguments[0], arguments[1], arguments[2]);
    try {
      devices = devices || [];

      this.devices.forEach((device) => {
        if (device.status !== 'offline') {
          const diff = this.discoveryPacketSequence - device.seenOnDiscovery;
          if (diff >= offlineTolerance) {
            device.status = 'offline';
            this.emit('offline', device);
          }
        }
      });

      // sometimes there is a race condition with setInterval where this is called after it was cleared
      // check and exit
      if (!this.isSocketBound) {
        return;
      }
      this.socket.send(discoveryMsgBuf, 0, discoveryMsgBuf.length, 9999, address);

      devices.forEach((d) => {
        this.log.debug('client.sendDiscovery() direct device:', d);
        this.socket.send(discoveryMsgBuf, 0, discoveryMsgBuf.length, d.port || 9999, d.host);
      });

      if (this.discoveryPacketSequence >= Number.MAX_VALUE) {
        this.discoveryPacketSequence = 0;
      } else {
        this.discoveryPacketSequence += 1;
      }
    } catch (err) {
      this.log.error('client.sendDiscovery: %s', err);
      this.emit('error', err);
    }

    return this;
  }
}
/**
 * @private
 */
function parseEmeter (response) {
  try {
    if (response.emeter.get_realtime.err_code === 0) {
      return response.emeter.get_realtime;
    }
  } catch (err) {}
  try {
    if (response['smartlife.iot.common.emeter'].get_realtime.err_code === 0) {
      return response['smartlife.iot.common.emeter'].get_realtime;
    }
  } catch (err) {}
}

module.exports = Client;
