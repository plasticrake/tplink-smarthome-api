'use strict';

const dgram = require('dgram');
const net = require('net');
const EventEmitter = require('events');
const { encrypt, encryptWithHeader, decrypt } = require('tplink-smarthome-crypto');

const Device = require('./device');
const Plug = require('./plug');
const Bulb = require('./bulb');

const discoveryMsgBuf = encrypt('{"system":{"get_sysinfo":{}}}');
let maxSocketId = 0;

/**
 * Send Options.
 *
 * @typedef {Object} SendOptions
 * @property {number} timeout  (ms)
 * @property {string} transport 'tcp','udp'
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
   * @param  {Number}      [options.defaultSendOptions.timeout=5000]  (ms)
   * @param  {string}      [options.defaultSendOptions.transport=tcp] 'tcp' or 'udp'
   * @param  {string}      [options.logLevel]       level for built in logger ['error','warn','info','debug','trace']
   */
  constructor ({ defaultSendOptions = { timeout: 5000, transport: 'tcp' }, logLevel, logger } = {}) {
    super();
    this.defaultSendOptions = defaultSendOptions;
    this.log = require('./logger')({ level: logLevel, logger: logger });

    this.devices = new Map();
    this.discoveryTimer = null;
    this.discoveryPacketSequence = 0;
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
    let thisSendOptions = Object.assign({}, this.defaultSendOptions, sendOptions);
    if (thisSendOptions.transport === 'udp') {
      return this.sendUdp(payload, host, port, thisSendOptions.timeout);
    }
    return this.sendTcp(payload, host, port, thisSendOptions.timeout);
  }
  /**
   * @private
   */
  async sendUdp (payload, host, port = 9999, timeout) {
    let socketId = maxSocketId += 1;
    this.log.debug(`[${socketId}] client.sendUdp(%j)`, { payload, host, port, timeout });

    return new Promise((resolve, reject) => {
      let socket;
      let isSocketBound = false;
      try {
        let payloadString = (!(typeof payload === 'string' || payload instanceof String) ? JSON.stringify(payload) : payload);

        socket = dgram.createSocket('udp4');

        let timer;
        if (timeout > 0) {
          timer = setTimeout(() => {
            this.log.debug(`[${socketId}] client.sendUdp(): timeout(${timeout})`);
            this.log.error('UDP Timeout');
            if (isSocketBound) socket.close();
            reject(new Error('UDP Timeout'));
          }, timeout);
        }

        socket.on('message', (msg, rinfo) => {
          clearTimeout(timer);
          this.log.debug(`[${socketId}] client.sendUdp(): socket:data %j`, rinfo);
          if (isSocketBound) socket.close();

          let decryptedMsg;
          try {
            decryptedMsg = decrypt(msg).toString('utf8');
            this.log.debug(`[${socketId}] client.sendUdp(): socket:data message: ${decryptedMsg}`);
            let msgObj = '';
            if (decryptedMsg !== '') {
              msgObj = JSON.parse(decryptedMsg);
            }
            resolve(msgObj);
          } catch (err) {
            this.log.error('Error parsing JSON: %s\nFrom: [%s UDP] Original: [%s] Decrypted: [%s]', err, rinfo, msg, decryptedMsg);
            reject(err);
          }
        });

        socket.on('error', (err) => {
          this.log.debug(`[${socketId}] client.sendUdp(): socket:error`, err);
          if (isSocketBound) socket.close();
          reject(err);
        });

        this.log.debug(`[${socketId}] client.sendUdp(): attempting to open. host:${host}, port:${port}`);
        socket.bind(() => {
          isSocketBound = true;
          this.log.debug(`[${socketId}] client.sendUdp(): listening on %j`, socket.address());
          let msgBuf = encrypt(payloadString);
          socket.send(msgBuf, 0, msgBuf.length, port, host);
        });
      } catch (err) {
        this.log.error(`UDP Error: %s`, err);
        if (isSocketBound) socket.close();
        reject(err);
      }
    });
  }
  /**
   * @private
   */
  sendTcp (payload, host, port = 9999, timeout) {
    let socketId = maxSocketId += 1;
    this.log.debug(`[${socketId}] client.sendTcp(%j)`, {payload, host, port, timeout});

    return new Promise((resolve, reject) => {
      let socket;
      let timer;
      let deviceDataBuf;
      let segmentCount = 0;
      try {
        let payloadString = (!(typeof payload === 'string' || payload instanceof String) ? JSON.stringify(payload) : payload);

        socket = new net.Socket();

        if (timeout > 0) {
          timer = setTimeout(() => {
            this.log.debug(`[${socketId}] client.sendTcp(): timeout(${timeout})`);
            this.log.error('TCP Timeout');
            socket.destroy();
            reject(new Error('TCP Timeout'));
          }, timeout);
        }

        socket.on('data', (data) => {
          segmentCount += 1;
          this.log.debug(`[${socketId}] client.sendTcp(): socket:data ${socket.remoteAddress}:${socket.remotePort} segment:${segmentCount}`);

          if (deviceDataBuf === undefined) {
            deviceDataBuf = data;
          } else {
            deviceDataBuf = Buffer.concat([deviceDataBuf, data], deviceDataBuf.length + data.length);
          }

          let expectedMsgLen = deviceDataBuf.slice(0, 4).readInt32BE();
          let actualMsgLen = deviceDataBuf.length - 4;

          if (actualMsgLen >= expectedMsgLen) {
            socket.end();
          }
        });

        socket.on('close', () => {
          this.log.debug(`[${socketId}] client.sendTcp(): socket:close`);
          clearTimeout(timer);

          if (deviceDataBuf == null) return;

          let expectedMsgLen = deviceDataBuf.slice(0, 4).readInt32BE();
          let actualMsgLen = deviceDataBuf.length - 4;

          if (actualMsgLen >= expectedMsgLen) {
            let decryptedMsg;
            try {
              decryptedMsg = decrypt(deviceDataBuf.slice(4)).toString('utf8');
              this.log.debug(`[${socketId}] client.sendTcp(): socket:close message: ${decryptedMsg}`);
              let msgObj = '';
              if (decryptedMsg !== '') {
                msgObj = JSON.parse(decryptedMsg);
              }
              resolve(msgObj);
            } catch (err) {
              this.log.error(`Error parsing JSON: %s\nFrom: [${socket.remoteAddress} ${socket.remotePort}] TCP ${segmentCount} ${actualMsgLen}/${expectedMsgLen} Original: [%s] Decrypted: [${decryptedMsg}]`, err, deviceDataBuf);
              reject(err);
            }
          }
        });

        socket.on('error', (err) => {
          this.log.debug(`[${socketId}] client.sendTcp(): socket:error`);
          socket.destroy();
          reject(err);
        });

        this.log.debug(`[${socketId}] client.sendTcp(): attempting to open. host:${host}, port:${port}`);
        socket.connect({port, host}, () => {
          this.log.debug(`[${socketId}] client.sendTcp(): socket:connect ${socket.remoteAddress} ${socket.remotePort}`);
          socket.write(encryptWithHeader(payloadString));
        });
      } catch (err) {
        clearTimeout(timer);
        this.log.error(`TCP Error: ${err}`);
        socket.destroy();
        reject(err);
      }
    });
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
    let data = await this.send('{"system":{"get_sysinfo":{}}}', host, port, sendOptions);
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
   * See {@link Device#constructor} and {@link Bulb#constructor} for valid options.
   * @param  {Object} deviceOptions passed to {@link Bulb#constructor}
   * @return {Bulb}
   */
  getBulb (deviceOptions) {
    return new Bulb(Object.assign({}, deviceOptions, { client: this, defaultSendOptions: this.defaultSendOptions }));
  }
  /**
   * Creates {@link Plug} object.
   *
   * See {@link Device#constructor} and {@link Plug#constructor} for valid options.
   * @param  {Object} deviceOptions passed to {@link Plug#constructor}
   * @return {Plug}
   */
  getPlug (deviceOptions) {
    return new Plug(Object.assign({}, deviceOptions, { client: this, defaultSendOptions: this.defaultSendOptions }));
  }
  /**
   * Creates a {@link Plug} or {@link Bulb} after querying device to determine type.
   *
   * See {@link Device#constructor}, {@link Bulb#constructor}, {@link Plug#constructor} for valid options.
   * @param  {Object}      deviceOptions passed to {@link Device#constructor}
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Plug|Bulb, Error>}
   */
  async getDevice (deviceOptions, sendOptions) {
    let sysInfo = await this.getSysInfo(deviceOptions.host, deviceOptions.port, sendOptions);
    return this.getDeviceFromSysInfo(sysInfo, Object.assign({}, deviceOptions, { client: this }));
  }
  /**
   * Create {@link Device} object.
   * - Device object only supports common Device methods.
   * - See {@link Device#constructor} for valid options.
   * - Instead use {@link #getDevice} to create a fully featured object.
   * @param  {Object} deviceOptions passed to {@link Device#constructor}
   * @return {Device}
   */
  getCommonDevice (deviceOptions) {
    return new Device(Object.assign({}, deviceOptions, { client: this, defaultSendOptions: this.defaultSendOptions }));
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
   * See {@link Device#constructor}, {@link Bulb#constructor}, {@link Plug#constructor} for valid options
   * @param  {Object} sysInfo
   * @param  {Object} deviceOptions passed to device constructor
   * @return {Plug|Bulb}
   */
  getDeviceFromSysInfo (sysInfo, deviceOptions) {
    let thisDeviceOptions = Object.assign({}, deviceOptions, { sysInfo: sysInfo });
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
   * - If `macAddresses` are specified only matching device with matching MAC addresses are found.
   * - If `devices` are specified it will attempt to contact them directly in addition to sending to the broadcast address.
   *   - `devices` are specified as an array of `[{host, [port: 9999]}]`.
   * @param  {Object}    options
   * @param  {string}   [options.address]                     address to bind udp socket
   * @param  {number}   [options.port]                        port to bind udp socket
   * @param  {string}   [options.broadcast=255.255.255.255] broadcast address
   * @param  {number}   [options.discoveryInterval=10000]     (ms)
   * @param  {number}   [options.discoveryTimeout=0]          (ms)
   * @param  {number}   [options.offlineTolerance=3]          # of consecutive missed replies to consider offline
   * @param  {string[]} [options.deviceTypes]                 'plug','bulb'
   * @param  {string[]} [options.macAddresses]                MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive
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
    deviceOptions = {},
    devices
  } = {}) {
    this.log.debug('client.startDiscovery(%j)', arguments[0]);

    try {
      macAddresses = macAddresses.map((mac) => normalizeMac(mac));

      this.socket = dgram.createSocket('udp4');

      this.socket.on('message', (msg, rinfo) => {
        const decryptedMsg = decrypt(msg).toString('utf8');

        this.log.debug(`client.startDiscovery(): socket:message From: ${rinfo.address} ${rinfo.port} Message: ${decryptedMsg}`);

        let jsonMsg;
        let sysInfo;
        try {
          jsonMsg = JSON.parse(decryptedMsg);
          sysInfo = jsonMsg.system.get_sysinfo;
        } catch (err) {
          this.log.debug(`client.startDiscovery(): Error parsing JSON: %s\nFrom: ${rinfo.address} ${rinfo.port} Original: [%s] Decrypted: [${decryptedMsg}]`, err, msg);
          this.emit('discovery-invalid', { rinfo, response: msg, decryptedResponse: decrypt(msg) });
          return;
        }

        if (deviceTypes && deviceTypes.length > 0) {
          const deviceType = this.getTypeFromSysInfo(sysInfo);
          if (deviceTypes.indexOf(deviceType) === -1) {
            this.log.debug(`client.startDiscovery(): Filtered out: ${sysInfo.alias} (${deviceType}), allowed device types: (%j)`, deviceTypes);
            return;
          }
        }

        if (macAddresses && macAddresses.length > 0) {
          const mac = normalizeMac(sysInfo.mac || sysInfo.mic_mac || sysInfo.ethernet_mac || '');
          if (macAddresses.indexOf(mac) === -1) {
            this.log.debug(`client.startDiscovery(): Filtered out: ${sysInfo.alias} (${mac}), allowed macs: (%j)`, macAddresses);
            return;
          }
        }

        this.createOrUpdateDeviceFromSysInfo({sysInfo, host: rinfo.address, port: rinfo.port, options: deviceOptions});
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
  createOrUpdateDeviceFromSysInfo ({ sysInfo, host, port, options }) {
    if (this.devices.has(sysInfo.deviceId)) {
      const device = this.devices.get(sysInfo.deviceId);
      device.host = host;
      device.port = port;
      device.sysInfo = sysInfo;
      device.status = 'online';
      device.seenOnDiscovery = this.discoveryPacketSequence;
      this.emit('online', device);
    } else {
      let deviceOptions = Object.assign({}, options, { client: this, deviceId: sysInfo.deviceId, host, port });
      const device = this.getDeviceFromSysInfo(sysInfo, deviceOptions);
      device.sysInfo = sysInfo;
      device.status = 'online';
      device.seenOnDiscovery = this.discoveryPacketSequence;
      this.devices.set(device.deviceId, device);
      this.emit('new', device);
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
          let diff = this.discoveryPacketSequence - device.seenOnDiscovery;
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

function normalizeMac (mac = '') {
  return mac.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

module.exports = Client;
