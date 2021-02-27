/* eslint-disable no-underscore-dangle */
import type { SendOptions } from '../client';
import Device, { isBulbSysinfo } from '../device';
import type { CommonSysinfo, DeviceConstructorOptions } from '../device';
import Cloud from '../shared/cloud';
import Emeter, { Realtime } from '../shared/emeter';
import Lighting, { LightState } from './lighting';
import Schedule from './schedule';
import Time from '../shared/time';

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

export interface BulbConstructorOptions extends DeviceConstructorOptions {
  sysInfo: BulbSysinfo;
}

export interface BulbEventEmitter {
  on(
    event: 'emeter-realtime-update',
    listener: (value: Realtime) => void
  ): this;

  on(event: 'polling-error', listener: (error: Error) => void): this;
  /**
   * Bulb was turned on (`lightstate.on_off`).
   * @event Bulb#lightstate-on
   * @property {object} value lightstate
   */
  on(event: 'lightstate-on', listener: (value: LightState) => void): this;
  /**
   * Bulb was turned off (`lightstate.on_off`).
   * @event Bulb#lightstate-off
   * @property {object} value lightstate
   */
  on(event: 'lightstate-off', listener: (value: LightState) => void): this;
  /**
   * Bulb's lightstate was changed.
   * @event Bulb#lightstate-change
   * @property {object} value lightstate
   */
  on(event: 'lightstate-change', listener: (value: LightState) => void): this;
  /**
   * Bulb's lightstate state was updated from device. Fired regardless if status was changed.
   * @event Bulb#lightstate-update
   * @property {object} value lightstate
   */
  on(event: 'lightstate-update', listener: (value: LightState) => void): this;

  emit(event: 'polling-error', error: Error): boolean;

  emit(event: 'emeter-realtime-update', value: Realtime): boolean;
  emit(event: 'lightstate-on', value: LightState): boolean;
  emit(event: 'lightstate-off', value: LightState): boolean;
  emit(event: 'lightstate-change', value: LightState): boolean;
  emit(event: 'lightstate-update', value: LightState): boolean;
}

/**
 * Bulb Device.
 *
 * @fires  Bulb#emeter-realtime-update
 * @fires  Bulb#lightstate-on
 * @fires  Bulb#lightstate-off
 * @fires  Bulb#lightstate-change
 * @fires  Bulb#lightstate-update
 */
export default class Bulb extends Device implements BulbEventEmitter {
  protected _sysInfo: BulbSysinfo;

  lastState = { inUse: false, powerOn: false };

  readonly supportsEmeter = true;

  static readonly apiModules = {
    system: 'smartlife.iot.common.system',
    cloud: 'smartlife.iot.common.cloud',
    schedule: 'smartlife.iot.common.schedule',
    timesetting: 'smartlife.iot.common.timesetting',
    emeter: 'smartlife.iot.common.emeter',
    netif: 'netif',
    lightingservice: 'smartlife.iot.smartbulb.lightingservice',
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
   * @param options -
   */
  constructor(options: BulbConstructorOptions) {
    super({
      client: options.client,
      _sysInfo: options.sysInfo,
      host: options.host,
      port: options.port,
      logger: options.logger,
      defaultSendOptions: options.defaultSendOptions,
    });

    this.lastState = Object.assign(this.lastState, {
      powerOn: null,
      inUse: null,
    });

    this.setSysInfo(options.sysInfo);
    this._sysInfo = options.sysInfo;
  }

  /**
   * Returns cached results from last retrieval of `system.sysinfo`.
   * @returns system.sysinfo
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
   * @returns Cached value of `sysinfo.is_dimmable === 1`
   */
  get supportsBrightness(): boolean {
    return this.sysInfo.is_dimmable === 1;
  }

  /**
   * Cached value of `sysinfo.is_color === 1`
   * @returns Cached value of `sysinfo.is_color === 1`
   */
  get supportsColor(): boolean {
    return this.sysInfo.is_color === 1;
  }

  /**
   * Cached value of `sysinfo.is_variable_color_temp === 1`
   * @returns Cached value of `sysinfo.is_variable_color_temp === 1`
   */
  get supportsColorTemperature(): boolean {
    return this.sysInfo.is_variable_color_temp === 1;
  }

  /**
   * Returns array with min and max supported color temperatures
   * @returns range in kelvin `{min,max}` or `null` if not supported
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
   * @returns parsed JSON response
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
   *
   * This command is likely to fail on some devices when using UDP transport.
   * This defaults to TCP transport unless overridden in sendOptions.
   *
   * @returns parsed JSON response
   */
  async getInfo(sendOptions?: SendOptions): Promise<Record<string, unknown>> {
    // force TCP unless overridden here
    const sendOptionsForGetInfo: SendOptions =
      sendOptions == null ? {} : sendOptions;
    if (!('transport' in sendOptionsForGetInfo))
      sendOptionsForGetInfo.transport = 'tcp';

    // TODO switch to sendCommand, but need to handle error for devices that don't support emeter
    const response = await this.send(
      `{"${this.apiModules.emeter}":{"get_realtime":{}},"${this.apiModules.lightingservice}":{"get_light_state":{}},"${this.apiModules.schedule}":{"get_next_action":{}},"system":{"get_sysinfo":{}},"${this.apiModules.cloud}":{"get_info":{}}}`,
      sendOptionsForGetInfo
    );
    const data = JSON.parse(response);
    this.setSysInfo(data.system.get_sysinfo);
    this.cloud.info = data[this.apiModules.cloud].get_info;
    this.emeter.realtime = data[this.apiModules.emeter].get_realtime;
    this.schedule.nextAction = data[this.apiModules.schedule].get_next_action;
    this.lighting.lightState =
      data[this.apiModules.lightingservice].get_light_state;
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
   * @throws {@link ResponseError}
   */
  async getPowerState(sendOptions?: SendOptions): Promise<boolean> {
    const lightState = await this.lighting.getLightState(sendOptions);
    return lightState.on_off === 1;
  }

  /**
   * Sets on/off state of Bulb.
   *
   * Sends `lightingservice.transition_light_state` command with on_off `value`.
   * @param  value - true: on, false: off
   * @throws {@link ResponseError}
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
   * @throws {@link ResponseError}
   */
  async togglePowerState(sendOptions?: SendOptions): Promise<boolean> {
    const powerState = await this.getPowerState(sendOptions);
    await this.setPowerState(!powerState, sendOptions);
    return !powerState;
  }
}
