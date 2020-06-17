/* eslint-disable no-underscore-dangle */
import type { SendOptions } from '../client';
import Device, { isBulbSysinfo } from '../device';
import type { CommonSysinfo, DeviceConstructorParameters } from '../device';
import Cloud from '../shared/cloud';
import Emeter from '../shared/emeter';
import Lighting from './lighting';
import Schedule from './schedule';
import Time from '../shared/time';

const enum BulbModules {
  system = 'smartlife.iot.common.system',
  cloud = 'smartlife.iot.common.cloud',
  schedule = 'smartlife.iot.common.schedule',
  timesetting = 'smartlife.iot.common.timesetting',
  emeter = 'smartlife.iot.common.emeter',
  netif = 'netif',
  lightingservice = 'smartlife.iot.smartbulb.lightingservice',
}

// type BulbGetInfo = {
//   [BulbModules.emeter]: { get_realtime: {} };
//   [BulbModules.lightingservice]: { get_light_state: {} };
//   [BulbModules.schedule]: { get_next_action: {} };
//   system: { get_sysinfo: {} };
//   [BulbModules.cloud]: { get_info: {} };
// };

type BulbSysinfoLightState = {
  on_off: 0 | 1;
};

export type BulbSysinfo = CommonSysinfo & {
  mic_type: string; // 'IOT.SMARTBULB';
  mic_mac: string;
  description: string;
  light_state: BulbSysinfoLightState;
  is_dimmable: 0 | 1;
  is_color: 0 | 1;
  is_variable_color_temp: 0 | 1;
};

/**
 * Bulb Device.
 *
 * TP-Link models: LB100, LB110, LB120, LB130.
 * @extends Device
 * @extends EventEmitter
 * @emits  Bulb#lightstate-on
 * @emits  Bulb#lightstate-off
 * @emits  Bulb#lightstate-change
 * @emits  Bulb#lightstate-update
 * @emits  Bulb#emeter-realtime-update
 */
export default class Bulb extends Device {
  protected _sysInfo: BulbSysinfo;

  lastState = { inUse: false, powerOn: false };

  protected supportsEmeter = true;

  static readonly apiModuleNamespace = {
    system: BulbModules.system,
    cloud: BulbModules.cloud,
    schedule: BulbModules.schedule,
    timesetting: BulbModules.timesetting,
    emeter: BulbModules.emeter,
    netif: BulbModules.netif,
    lightingservice: BulbModules.lightingservice,
  };

  /**
   * @borrows Cloud#getInfo as Bulb.cloud#getInfo
   * @borrows Cloud#bind as Bulb.cloud#bind
   * @borrows Cloud#unbind as Bulb.cloud#unbind
   * @borrows Cloud#getFirmwareList as Bulb.cloud#getFirmwareList
   * @borrows Cloud#setServerUrl as Bulb.cloud#setServerUrl
   */
  readonly cloud = new Cloud(this, 'smartlife.iot.common.cloud');

  /**
   * Bulb's Energy Monitoring Details were updated from device. Fired regardless if status was changed.
   * @event Bulb#emeter-realtime-update
   * @property {Object} value emeterRealtime
   */
  /**
   * @borrows Emeter#realtime as Bulb.emeter#realtime
   * @borrows Emeter#getRealtime as Bulb.emeter#getRealtime
   * @borrows Emeter#getDayStats as Bulb.emeter#getDayStats
   * @borrows Emeter#getMonthStats as Bulb.emeter#getMonthStats
   * @borrows Emeter#eraseStats as Bulb.emeter#eraseStats
   */
  readonly emeter = new Emeter(this, 'smartlife.iot.common.emeter');

  /**
   * @borrows Lighting#lightState as Bulb.lighting#lightState
   * @borrows Lighting#getLightState as Bulb.lighting#getLightState
   * @borrows Lighting#setLightState as Bulb.lighting#setLightState
   */
  readonly lighting = new Lighting(
    this,
    'smartlife.iot.smartbulb.lightingservice'
  );

  /**
   * @borrows Schedule#getNextAction as Bulb.schedule#getNextAction
   * @borrows Schedule#getRules as Bulb.schedule#getRules
   * @borrows Schedule#getRule as Bulb.schedule#getRule
   * @borrows BulbSchedule#addRule as Bulb.schedule#addRule
   * @borrows BulbSchedule#editRule as Bulb.schedule#editRule
   * @borrows Schedule#deleteAllRules as Bulb.schedule#deleteAllRules
   * @borrows Schedule#deleteRule as Bulb.schedule#deleteRule
   * @borrows Schedule#setOverallEnable as Bulb.schedule#setOverallEnable
   * @borrows Schedule#getDayStats as Bulb.schedule#getDayStats
   * @borrows Schedule#getMonthStats as Bulb.schedule#getMonthStats
   * @borrows Schedule#eraseStats as Bulb.schedule#eraseStats
   */
  readonly schedule = new Schedule(this, 'smartlife.iot.common.schedule');

  /**
   * @borrows Time#getTime as Bulb.time#getTime
   * @borrows Time#getTimezone as Bulb.time#getTimezone
   */
  readonly time = new Time(this, 'smartlife.iot.common.timesetting');

  /**
   * Created by {@link Client} - Do not instantiate directly.
   *
   * See [Device constructor]{@link Device} for common options.
   * @see Device
   * @param  {Object} options
   */
  constructor({
    client,
    sysInfo,
    host,
    port,
    logger,
    defaultSendOptions,
  }: Omit<DeviceConstructorParameters[0], 'sysInfo'> & {
    sysInfo: BulbSysinfo;
  }) {
    super({
      client,
      _sysInfo: sysInfo,
      host,
      port,
      logger,
      defaultSendOptions,
    });

    this.lastState = Object.assign(this.lastState, {
      powerOn: null,
      inUse: null,
    });

    this.setSysInfo(sysInfo);
    this._sysInfo = sysInfo;
  }

  /**
   * Returns cached results from last retrieval of `system.sysinfo`.
   * @return {Object} system.sysinfo
   */
  get sysInfo(): BulbSysinfo {
    return this._sysInfo;
  }

  /**
   * @internal
   */
  setSysInfo(sysInfo: BulbSysinfo): void {
    super.setSysInfo(sysInfo);
    // TODO / XXX Verify that sysInfo.light_state can be set here to trigger events
    this.lighting.lightState = sysInfo.light_state;
  }

  /**
   * @internal
   */
  protected setAliasProperty(alias: string): void {
    this.sysInfo.alias = alias;
  }

  /**
   * Cached value of `sysinfo.[description|dev_name]`.
   */
  get description(): string | undefined {
    return this.sysInfo.description;
  }

  // eslint-disable-next-line class-methods-use-this
  get deviceType(): 'bulb' {
    return 'bulb';
  }

  /**
   * Cached value of `sysinfo.is_dimmable === 1`
   * @return {boolean}
   */
  get supportsBrightness(): boolean {
    return this.sysInfo.is_dimmable === 1;
  }

  /**
   * Cached value of `sysinfo.is_color === 1`
   * @return {boolean}
   */
  get supportsColor(): boolean {
    return this.sysInfo.is_color === 1;
  }

  /**
   * Cached value of `sysinfo.is_variable_color_temp === 1`
   * @return {boolean}
   */
  get supportsColorTemperature(): boolean {
    return this.sysInfo.is_variable_color_temp === 1;
  }

  /**
   * Returns array with min and max supported color temperatures
   * @returns range {min,max} or `null` if not supported
   */
  get getColorTemperatureRange(): { min: number; max: number } | null {
    if (!this.supportsColorTemperature) return null;
    switch (true) {
      case /LB130/i.test(this.sysInfo.model):
        return { min: 2500, max: 9000 };
      default:
        return { min: 2700, max: 6500 };
    }
  }

  /**
   * Gets bulb's SysInfo.
   *
   * Requests `system.sysinfo` from device.
   * @param  {SendOptions}  [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getSysInfo(sendOptions?: SendOptions): Promise<BulbSysinfo> {
    const response = await super.getSysInfo(sendOptions);

    if (!isBulbSysinfo(response)) {
      throw new Error(`Unexpected Response: ${response}`);
    }

    return this.sysInfo;
  }

  /**
   * Requests common Bulb status details in a single request.
   * - `system.get_sysinfo`
   * - `cloud.get_sysinfo`
   * - `emeter.get_realtime`
   * - `schedule.get_next_action`
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, Error>} parsed JSON response
   */
  async getInfo(sendOptions?: SendOptions): Promise<object> {
    // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
    const response = await this.send(
      `{"${this.apiModule.emeter}":{"get_realtime":{}},"${this.apiModule.lightingservice}":{"get_light_state":{}},"${this.apiModule.schedule}":{"get_next_action":{}},"system":{"get_sysinfo":{}},"${this.apiModule.cloud}":{"get_info":{}}}`,
      sendOptions
    );
    const data = JSON.parse(response);
    this.setSysInfo(data.system.get_sysinfo);
    this.cloud.info = data[this.apiModule.cloud].get_info;
    this.emeter.realtime = data[this.apiModule.emeter].get_realtime;
    this.schedule.nextAction = data[this.apiModule.schedule].get_next_action;
    this.lighting.lightState =
      data[this.apiModule.lightingservice].get_light_state;
    return {
      sysInfo: this.sysInfo,
      cloud: { info: this.cloud.info },
      emeter: { realtime: this.emeter.realtime },
      schedule: { nextAction: this.schedule.nextAction },
      lighting: { lightState: this.lighting.lightState },
    };
  }

  /**
   * Gets on/off state of Bulb.
   *
   * Requests `lightingservice.get_light_state` and returns true if `on_off === 1`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async getPowerState(sendOptions?: SendOptions): Promise<boolean> {
    const lightState = await this.lighting.getLightState(sendOptions);
    // @ts-ignore
    return lightState.on_off === 1;
  }

  /**
   * Sets on/off state of Bulb.
   *
   * Sends `lightingservice.transition_light_state` command with on_off `value`.
   * @param  {boolean}     value          true: on, false: off
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setPowerState(
    value: boolean,
    sendOptions?: SendOptions
  ): Promise<boolean> {
    return this.lighting.setLightState({ on_off: value ? 1 : 0 }, sendOptions);
  }

  /**
   * Toggles state of Bulb.
   *
   * Requests `lightingservice.get_light_state` sets the power state to the opposite of `on_off === 1` and returns the new power state.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async togglePowerState(sendOptions?: SendOptions): Promise<boolean> {
    const powerState = await this.getPowerState(sendOptions);
    await this.setPowerState(!powerState, sendOptions);
    return !powerState;
  }
}
