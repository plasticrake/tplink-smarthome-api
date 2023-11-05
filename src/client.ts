import { Socket, createSocket, RemoteInfo } from 'dgram';
import { EventEmitter } from 'events';
import util from 'util';

import type log from 'loglevel';
import { encrypt, decrypt } from 'tplink-smarthome-crypto';
import type { MarkOptional } from 'ts-essentials';

import Device, { isBulbSysinfo, isPlugSysinfo } from './device';
import type { Sysinfo } from './device';
import Bulb from './bulb';
import Plug, { hasSysinfoChildren } from './plug';
import createLogger from './logger';
import type { Logger } from './logger';
import TcpConnection from './network/tcp-connection';
import UdpConnection from './network/udp-connection';
import { compareMac, isObjectLike } from './utils';
import { Realtime } from './shared/emeter';

const discoveryMsgBuf = encrypt('{"system":{"get_sysinfo":{}}}');

export type AnyDevice = Bulb | Plug;

type DeviceDiscovery = { status: string; seenOnDiscovery: number };
type AnyDeviceDiscovery = (Bulb | Plug) & Partial<DeviceDiscovery>;

type SysinfoResponse = { system: { get_sysinfo: Sysinfo } };
type EmeterResponse = PlugEmeterResponse | BulbEmeterResponse;
type PlugEmeterResponse = {
  emeter?: { get_realtime?: { err_code: number } & Realtime };
};
type BulbEmeterResponse = {
  'smartlife.iot.common.emeter'?: {
    get_realtime?: { err_code: number } & Realtime;
  };
};
type DiscoveryResponse = SysinfoResponse & EmeterResponse;

type AnyDeviceOptions =
  | ConstructorParameters<typeof Bulb>[0]
  | ConstructorParameters<typeof Plug>[0];

type AnyDeviceOptionsCon =
  | MarkOptional<ConstructorParameters<typeof Plug>[0], 'client' | 'sysInfo'>
  | MarkOptional<ConstructorParameters<typeof Bulb>[0], 'client' | 'sysInfo'>;

type DeviceOptionsDiscovery =
  | MarkOptional<
      ConstructorParameters<typeof Plug>[0],
      'client' | 'sysInfo' | 'host'
    >
  | MarkOptional<
      ConstructorParameters<typeof Bulb>[0],
      'client' | 'sysInfo' | 'host'
    >;

export type DiscoveryDevice = { host: string; port?: number };

function isSysinfoResponse(candidate: unknown): candidate is SysinfoResponse {
  return (
    isObjectLike(candidate) &&
    'system' in candidate &&
    isObjectLike(candidate.system) &&
    'get_sysinfo' in candidate.system
  );
}

export interface ClientConstructorOptions {
  /**
   * @defaultValue \{
   *   timeout: 10000,
   *   transport: 'tcp',
   *   useSharedSocket: false,
   *   sharedSocketTimeout: 20000
   * \}
   */
  defaultSendOptions?: SendOptions;
  /**
   * @defaultValue 'warn'
   */
  logLevel?: log.LogLevelDesc;
  logger?: Logger;
}

export interface DiscoveryOptions {
  /**
   * address to bind udp socket
   */
  address?: string;
  /**
   * port to bind udp socket
   */
  port?: number;
  /**
   * broadcast address
   * @defaultValue '255.255.255.255'
   */
  broadcast?: string;
  /**
   * Interval in (ms)
   * @defaultValue 10000
   */
  discoveryInterval?: number;
  /**
   * Timeout in (ms)
   * @defaultValue 0
   */
  discoveryTimeout?: number;
  /**
   * Number of consecutive missed replies to consider offline
   * @defaultValue 3
   */
  offlineTolerance?: number;
  deviceTypes?: Array<'plug' | 'bulb'>;
  /**
   * MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive, glob style *, and ? in pattern are supported
   * @defaultValue []
   */
  macAddresses?: string[];
  /**
   * MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive, glob style *, and ? in pattern are supported
   * @defaultValue []
   */
  excludeMacAddresses?: string[];
  /**
   * called with fn(sysInfo), return truthy value to include device
   */
  filterCallback?: (sysInfo: Sysinfo) => boolean;
  /**
   * if device has multiple outlets, create a separate plug for each outlet, otherwise create a plug for the main device
   * @defaultValue true
   */
  breakoutChildren?: boolean;
  /**
   * Set device port to the port it responded with to the discovery ping
   * @defaultValue false
   */
  devicesUseDiscoveryPort?: boolean;
  /**
   * passed to device constructors
   */
  deviceOptions?: DeviceOptionsDiscovery;
  /**
   * known devices to query instead of relying only on broadcast
   */
  devices?: DiscoveryDevice[];
}

/**
 * Send Options.
 *
 * @typeParam timeout - (ms)
 * @typeParam transport - 'tcp','udp'
 * @typeParam useSharedSocket - attempt to reuse a shared socket if available, UDP only
 * @typeParam sharedSocketTimeout - (ms) how long to wait for another send before closing a shared socket. 0 = never automatically close socket
 */
export type SendOptions = {
  timeout?: number;
  transport?: 'tcp' | 'udp';
  useSharedSocket?: boolean;
  sharedSocketTimeout?: number;
};

export interface ClientEventEmitter {
  /**
   * First response from device.
   */
  on(
    event: 'device-new',
    listener: (device: Device | Bulb | Plug) => void,
  ): this;
  /**
   * Follow up response from device.
   */
  on(
    event: 'device-online',
    listener: (device: Device | Bulb | Plug) => void,
  ): this;
  /**
   * No response from device.
   */
  on(
    event: 'device-offline',
    listener: (device: Device | Bulb | Plug) => void,
  ): this;
  /**
   * First response from Bulb.
   */
  on(event: 'bulb-new', listener: (device: Bulb) => void): this;
  /**
   * Follow up response from Bulb.
   */
  on(event: 'bulb-online', listener: (device: Bulb) => void): this;
  /**
   * No response from Bulb.
   */
  on(event: 'bulb-offline', listener: (device: Bulb) => void): this;
  /**
   * First response from Plug.
   */
  on(event: 'plug-new', listener: (device: Plug) => void): this;
  /**
   * Follow up response from Plug.
   */
  on(event: 'plug-online', listener: (device: Plug) => void): this;
  /**
   * No response from Plug.
   */
  on(event: 'plug-offline', listener: (device: Plug) => void): this;
  /**
   * Invalid/Unknown response from device.
   */
  on(
    event: 'discovery-invalid',
    listener: ({
      rinfo,
      response,
      decryptedResponse,
    }: {
      rinfo: RemoteInfo;
      response: Buffer;
      decryptedResponse: Buffer;
    }) => void,
  ): this;
  /**
   * Error during discovery.
   */
  on(event: 'error', listener: (error: Error) => void): this;

  emit(event: 'device-new', device: Device | Bulb | Plug): boolean;
  emit(event: 'device-online', device: Device | Bulb | Plug): boolean;
  emit(event: 'device-offline', device: Device | Bulb | Plug): boolean;
  emit(event: 'bulb-new', device: Bulb): boolean;
  emit(event: 'bulb-online', device: Bulb): boolean;
  emit(event: 'bulb-offline', device: Bulb): boolean;
  emit(event: 'plug-new', device: Plug): boolean;
  emit(event: 'plug-online', device: Plug): boolean;
  emit(event: 'plug-offline', device: Plug): boolean;
  emit(
    event: 'discovery-invalid',
    {
      rinfo,
      response,
      decryptedResponse,
    }: { rinfo: RemoteInfo; response: Buffer; decryptedResponse: Buffer },
  ): boolean;
  emit(event: 'error', error: Error): boolean;
}

/**
 * Client that sends commands to specified devices or discover devices on the local subnet.
 * - Contains factory methods to create devices.
 * - Events are emitted after {@link #startDiscovery} is called.
 * @noInheritDoc
 */
export default class Client extends EventEmitter implements ClientEventEmitter {
  defaultSendOptions: Required<SendOptions> = {
    timeout: 10000,
    transport: 'tcp',
    useSharedSocket: false,
    sharedSocketTimeout: 20000,
  };

  log: Logger;

  devices: Map<string, AnyDeviceDiscovery> = new Map();

  discoveryTimer: NodeJS.Timeout | null = null;

  discoveryPacketSequence = 0;

  maxSocketId = 0;

  socket?: Socket;

  isSocketBound = false;

  constructor(options: ClientConstructorOptions = {}) {
    super();
    const { defaultSendOptions, logLevel = 'warn', logger } = options;

    this.defaultSendOptions = {
      ...this.defaultSendOptions,
      ...defaultSendOptions,
    };

    this.log = createLogger({ logger, level: logLevel });
  }

  /**
   * Used by `tplink-connection`
   * @internal
   */
  getNextSocketId(): number {
    this.maxSocketId += 1;
    return this.maxSocketId;
  }

  /**
   * {@link https://github.com/plasticrake/tplink-smarthome-crypto | Encrypts} `payload` and sends to device.
   * - If `payload` is not a string, it is `JSON.stringify`'d.
   * - Promise fulfills with encrypted string response.
   *
   * Devices use JSON to communicate.\
   * For Example:
   * - If a device receives:
   *   - `{"system":{"get_sysinfo":{}}}`
   * - It responds with:
   * ```
   *     {"system":{"get_sysinfo":{
   *       err_code: 0,
   *       sw_ver: "1.0.8 Build 151113 Rel.24658",
   *       hw_ver: "1.0",
   *       ...
   *     }}}
   * ```
   *
   * All responses from device contain an `err_code` (`0` is success).
   *
   * @returns decrypted string response
   */
  async send(
    payload: Record<string, unknown> | string,
    host: string,
    port = 9999,
    sendOptions?: SendOptions,
  ): Promise<string> {
    const thisSendOptions = {
      ...this.defaultSendOptions,
      ...sendOptions,
      useSharedSocket: false,
    };

    const payloadString = !(typeof payload === 'string')
      ? JSON.stringify(payload)
      : payload;

    let connection: UdpConnection | TcpConnection;

    if (thisSendOptions.transport === 'udp') {
      connection = new UdpConnection(host, port, this.log, this);
    } else {
      connection = new TcpConnection(host, port, this.log, this);
    }
    const response = await connection.send(
      payloadString,
      port,
      host,
      thisSendOptions,
    );
    connection.close();
    return response;
  }

  /**
   * Requests `{system:{get_sysinfo:{}}}` from device.
   *
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   * @throws {@link Error}
   */
  async getSysInfo(
    host: string,
    port = 9999,
    sendOptions?: SendOptions,
  ): Promise<Sysinfo> {
    this.log.debug('client.getSysInfo(%j)', { host, port, sendOptions });
    const response = await this.send(
      '{"system":{"get_sysinfo":{}}}',
      host,
      port,
      sendOptions,
    );

    const responseObj = JSON.parse(response);
    if (isSysinfoResponse(responseObj)) {
      return responseObj.system.get_sysinfo;
    }

    throw new Error(`Unexpected Response: ${response}`);
  }

  /**
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(eventName: string, ...args: any[]): boolean {
    // Add device- / plug- / bulb- to eventName
    let ret = false;
    if (args[0] instanceof Device) {
      if (super.emit(`device-${eventName}`, ...args)) {
        ret = true;
      }
      if (args[0].deviceType !== 'device') {
        if (super.emit(`${args[0].deviceType}-${eventName}`, ...args)) {
          ret = true;
        }
      }
    } else if (super.emit(eventName, ...args)) {
      ret = true;
    }
    return ret;
  }

  /**
   * Creates Bulb object.
   *
   * See [Device constructor]{@link Device} and [Bulb constructor]{@link Bulb} for valid options.
   * @param   deviceOptions - passed to [Bulb constructor]{@link Bulb}
   */
  getBulb(
    deviceOptions: MarkOptional<
      ConstructorParameters<typeof Bulb>[0],
      'client'
    >,
  ): Bulb {
    return new Bulb({
      defaultSendOptions: this.defaultSendOptions,
      ...deviceOptions,
      client: this,
    });
  }

  /**
   * Creates {@link Plug} object.
   *
   * See [Device constructor]{@link Device} and [Plug constructor]{@link Plug} for valid options.
   * @param   deviceOptions - passed to [Plug constructor]{@link Plug}
   */
  getPlug(
    deviceOptions: MarkOptional<
      ConstructorParameters<typeof Plug>[0],
      'client'
    >,
  ): Plug {
    return new Plug({
      defaultSendOptions: this.defaultSendOptions,
      ...deviceOptions,
      client: this,
    });
  }

  /**
   * Creates a {@link Plug} or {@link Bulb} from passed in sysInfo or after querying device to determine type.
   *
   * See [Device constructor]{@link Device}, [Bulb constructor]{@link Bulb}, [Plug constructor]{@link Plug} for valid options.
   * @param   deviceOptions - passed to [Device constructor]{@link Device}
   * @throws {@link ResponseError}
   */
  async getDevice(
    deviceOptions: AnyDeviceOptionsCon,
    sendOptions?: SendOptions,
  ): Promise<AnyDevice> {
    this.log.debug('client.getDevice(%j)', { deviceOptions, sendOptions });
    let sysInfo: Sysinfo;
    if ('sysInfo' in deviceOptions && deviceOptions.sysInfo !== undefined) {
      sysInfo = deviceOptions.sysInfo;
    } else {
      sysInfo = await this.getSysInfo(
        deviceOptions.host,
        deviceOptions.port,
        sendOptions,
      );
    }

    const combinedDeviceOptions = {
      ...deviceOptions,
      client: this,
    } as AnyDeviceOptions;
    return this.getDeviceFromSysInfo(sysInfo, combinedDeviceOptions);
  }

  /**
   * Creates device corresponding to the provided `sysInfo`.
   *
   * See [Device constructor]{@link Device}, [Bulb constructor]{@link Bulb}, [Plug constructor]{@link Plug} for valid options
   * @param  deviceOptions - passed to device constructor
   * @throws {@link Error}
   */
  getDeviceFromSysInfo(
    sysInfo: Sysinfo,
    deviceOptions: AnyDeviceOptionsCon,
  ): AnyDevice {
    if (isPlugSysinfo(sysInfo)) {
      return this.getPlug({ ...deviceOptions, sysInfo });
    }
    if (isBulbSysinfo(sysInfo)) {
      return this.getBulb({ ...deviceOptions, sysInfo });
    }
    throw new Error('Could not determine device from sysinfo');
  }

  /**
   * Guess the device type from provided `sysInfo`.
   *
   * Based on sysinfo.[type|mic_type]
   */
  // eslint-disable-next-line class-methods-use-this
  getTypeFromSysInfo(
    sysInfo: { type: string } | { mic_type: string },
  ): 'plug' | 'bulb' | 'device' {
    const type = 'type' in sysInfo ? sysInfo.type : sysInfo.mic_type;
    switch (true) {
      case /plug/i.test(type):
        return 'plug';
      case /bulb/i.test(type):
        return 'bulb';
      default:
        return 'device';
    }
  }

  /**
   * Discover TP-Link Smarthome devices on the network.
   *
   * - Sends a discovery packet (via UDP) to the `broadcast` address every `discoveryInterval`(ms).
   * - Stops discovery after `discoveryTimeout`(ms) (if `0`, runs until {@link Client.stopDiscovery} is called).
   *   - If a device does not respond after `offlineTolerance` number of attempts, {@link Client.device-offline} is emitted.
   * - If `deviceTypes` are specified only matching devices are found.
   * - If `macAddresses` are specified only devices with matching MAC addresses are found.
   * - If `excludeMacAddresses` are specified devices with matching MAC addresses are excluded.
   * - if `filterCallback` is specified only devices where the callback returns a truthy value are found.
   * - If `devices` are specified it will attempt to contact them directly in addition to sending to the broadcast address.
   *   - `devices` are specified as an array of `[{host, [port: 9999]}]`.
   * @fires  Client#error
   * @fires  Client#device-new
   * @fires  Client#device-online
   * @fires  Client#device-offline
   * @fires  Client#bulb-new
   * @fires  Client#bulb-online
   * @fires  Client#bulb-offline
   * @fires  Client#plug-new
   * @fires  Client#plug-online
   * @fires  Client#plug-offline
   * @fires  Client#discovery-invalid
   */
  startDiscovery(options: DiscoveryOptions = {}): this {
    this.log.debug('client.startDiscovery(%j)', options);

    const {
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
      devicesUseDiscoveryPort = false,
      deviceOptions,
      devices,
    } = options;

    try {
      const socket = createSocket('udp4');
      this.socket = socket;

      socket.on('message', (msg, rinfo) => {
        const decryptedMsg = decrypt(msg).toString('utf8');

        this.log.debug(
          `client.startDiscovery(): socket:message From: ${rinfo.address} ${rinfo.port} Message: ${decryptedMsg}`,
        );

        try {
          // TODO: Type checking of response/sysInfo could be improved
          let response: DiscoveryResponse;
          let sysInfo: Sysinfo;
          try {
            response = JSON.parse(decryptedMsg);
            sysInfo = response.system.get_sysinfo;
            if (sysInfo == null)
              throw new Error('system.get_sysinfo is null or undefined');
            if (!isObjectLike(sysInfo))
              throw new Error('system.get_sysinfo is not an object');
          } catch (err) {
            this.log.debug(
              `client.startDiscovery(): Error parsing JSON: %s\nFrom: ${rinfo.address} ${rinfo.port} Original: [%s] Decrypted: [${decryptedMsg}]`,
              err,
              msg,
            );
            this.emit('discovery-invalid', {
              rinfo,
              response: msg,
              decryptedResponse: decryptedMsg,
            });
            return;
          }

          if (deviceTypes && deviceTypes.length > 0) {
            const deviceType = this.getTypeFromSysInfo(sysInfo);
            if (!(deviceTypes as string[]).includes(deviceType)) {
              this.log.debug(
                `client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}] (${deviceType}), allowed device types: (%j)`,
                deviceTypes,
              );
              return;
            }
          }

          let mac: string;
          if ('mac' in sysInfo) mac = sysInfo.mac;
          else if ('mic_mac' in sysInfo) mac = sysInfo.mic_mac;
          else if ('ethernet_mac' in sysInfo) mac = sysInfo.ethernet_mac;
          else mac = '';

          if (macAddresses && macAddresses.length > 0) {
            if (!compareMac(mac, macAddresses)) {
              this.log.debug(
                `client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}] (${mac}), allowed macs: (%j)`,
                macAddresses,
              );
              return;
            }
          }

          if (excludeMacAddresses && excludeMacAddresses.length > 0) {
            if (compareMac(mac, excludeMacAddresses)) {
              this.log.debug(
                `client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}] (${mac}), excluded mac`,
              );
              return;
            }
          }

          if (typeof filterCallback === 'function') {
            if (!filterCallback(sysInfo)) {
              this.log.debug(
                `client.startDiscovery(): Filtered out: ${sysInfo.alias} [${sysInfo.deviceId}], callback`,
              );
              return;
            }
          }

          this.createOrUpdateDeviceFromSysInfo({
            sysInfo,
            host: rinfo.address,
            port: devicesUseDiscoveryPort ? rinfo.port : undefined,
            breakoutChildren,
            options: deviceOptions,
          });
        } catch (err) {
          this.log.debug(
            `client.startDiscovery(): Error processing response: %s\nFrom: ${rinfo.address} ${rinfo.port} Original: [%s] Decrypted: [${decryptedMsg}]`,
            err,
            msg,
          );
          this.emit('discovery-invalid', {
            rinfo,
            response: msg,
            decryptedResponse: decrypt(msg),
          });
        }
      });

      socket.on('error', (err) => {
        this.log.error('client.startDiscovery: UDP Error: %s', err);
        this.stopDiscovery();
        this.emit('error', err);
        // TODO
      });

      socket.bind(port, address, () => {
        this.isSocketBound = true;
        const sockAddress = socket.address();
        this.log.debug(
          `client.socket: UDP ${sockAddress.family} listening on ${sockAddress.address}:${sockAddress.port}`,
        );
        socket.setBroadcast(true);

        this.discoveryTimer = setInterval(() => {
          this.sendDiscovery(
            socket,
            broadcast,
            devices ?? [],
            offlineTolerance,
          );
        }, discoveryInterval);

        this.sendDiscovery(socket, broadcast, devices ?? [], offlineTolerance);
        if (discoveryTimeout > 0) {
          setTimeout(() => {
            this.log.debug(
              'client.startDiscovery: discoveryTimeout reached, stopping discovery',
            );
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

  private static setSysInfoForDevice(
    device: AnyDeviceDiscovery,
    sysInfo: Sysinfo,
  ): void {
    if (device instanceof Plug) {
      if (!isPlugSysinfo(sysInfo)) {
        throw new TypeError(
          util.format('Expected PlugSysinfo but received: %O', sysInfo),
        );
      }
      device.setSysInfo(sysInfo);
    } else if (device instanceof Bulb) {
      if (!isBulbSysinfo(sysInfo)) {
        throw new TypeError(
          util.format('Expected BulbSysinfo but received: %O', sysInfo),
        );
      }
      device.setSysInfo(sysInfo);
    }
  }

  private createOrUpdateDeviceFromSysInfo({
    sysInfo,
    host,
    port,
    options,
    breakoutChildren,
  }: {
    sysInfo: Sysinfo;
    host: string;
    port?: number;
    options?: DeviceOptionsDiscovery;
    breakoutChildren: boolean;
  }): void {
    const process = (id: string, childId?: string): void => {
      let device: AnyDeviceDiscovery;
      if (this.devices.has(id) && this.devices.get(id) !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        device = this.devices.get(id)!;
        device.host = host;
        if (port != null) device.port = port;
        Client.setSysInfoForDevice(device, sysInfo);
        device.status = 'online';
        device.seenOnDiscovery = this.discoveryPacketSequence;
        this.emit('online', device);
      } else {
        const opts: AnyDeviceOptionsCon = {
          ...options,
          client: this,
          host,
          childId,
        };
        if (port != null) opts.port = port;
        device = this.getDeviceFromSysInfo(sysInfo, opts);

        device.status = 'online';
        device.seenOnDiscovery = this.discoveryPacketSequence;
        this.devices.set(id, device);
        this.emit('new', device);
      }
    };

    if (breakoutChildren && hasSysinfoChildren(sysInfo)) {
      sysInfo.children.forEach((child) => {
        const childId =
          child.id.length === 2 ? sysInfo.deviceId + child.id : child.id;
        process(childId, childId);
      });
    } else {
      process(sysInfo.deviceId);
    }
  }

  /**
   * Stops discovery and closes UDP socket.
   */
  stopDiscovery(): void {
    this.log.debug('client.stopDiscovery()');
    if (this.discoveryTimer !== null) clearInterval(this.discoveryTimer);
    this.discoveryTimer = null;
    if (this.isSocketBound) {
      this.isSocketBound = false;
      if (this.socket != null) this.socket.close();
    }
  }

  private sendDiscovery(
    socket: Socket,
    address: string,
    devices: DiscoveryDevice[],
    offlineTolerance: number,
  ): void {
    this.log.debug(
      'client.sendDiscovery(%s, %j, %s)',
      address,
      devices,
      offlineTolerance,
    );
    try {
      this.devices.forEach((device) => {
        if (device.status !== 'offline') {
          const diff =
            this.discoveryPacketSequence - (device.seenOnDiscovery || 0);

          if (diff >= offlineTolerance) {
            // eslint-disable-next-line no-param-reassign
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
      socket.send(discoveryMsgBuf, 0, discoveryMsgBuf.length, 9999, address);

      devices.forEach((d) => {
        this.log.debug('client.sendDiscovery() direct device:', d);
        socket.send(
          discoveryMsgBuf,
          0,
          discoveryMsgBuf.length,
          d.port || 9999,
          d.host,
        );
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
  }
}
