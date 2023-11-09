/* eslint-disable no-underscore-dangle */
import isEqual from 'lodash.isequal';

import type { SendOptions } from '../client';
import Device, {
  isBulbSysinfo,
  type CommonSysinfo,
  type DeviceConstructorOptions,
} from '../device';
import Cloud, { isCloudInfo, type CloudInfo } from '../shared/cloud';
import type { Realtime, RealtimeNormalized } from '../shared/emeter';
import Emeter from '../shared/emeter';
import Time from '../shared/time';
import {
  extractResponse,
  hasErrCode,
  isObjectLike,
  objectHasKey,
  type HasErrCode,
} from '../utils';
import Lighting, {
  isLightState,
  type LightState,
  type LightStateInput,
} from './lighting';
import Schedule from './schedule';

function isLightStrip(sysinfo: BulbSysinfo) {
  return (sysinfo.length ?? 0) > 0;
}

const TPLINK_KELVIN: Array<[RegExp, number, number]> = [
  [/^KB130/, 2500, 9000],
  [/^KL120\(EU\)/, 2700, 6500],
  [/^KL120\(US\)/, 2700, 5000],
  [/^KL125/, 2500, 6500],
  [/^KL130/, 2500, 9000],
  [/^KL135/, 2500, 9000],
  [/^KL430/, 2500, 9000],
  [/^LB120/, 2700, 6500],
  [/^LB130/, 2500, 9000],
  [/^LB230/, 2500, 9000],
  [/./, 2700, 6500], // default
];

export interface BulbSysinfoLightState {
  /**
   * (ms)
   */
  transition_period?: number;
  /**
   * (ms)
   */
  transition?: number;
  on_off?: 0 | 1;
  mode?: string;
  /**
   * 0-360
   */
  hue?: number;
  /**
   * 0-100
   */
  saturation?: number;
  /**
   * 0-100
   */
  brightness?: number;
  /**
   * Kelvin
   */
  color_temp?: number;
  ignore_default?: 0 | 1;
  dft_on_state?: {
    mode?: string;
    hue?: number;
    saturation?: number;
    color_temp?: number;
    brightness?: number;
  };
}

export type BulbSysinfo = CommonSysinfo & {
  mic_type: string; // 'IOT.SMARTBULB';
  mic_mac: string;
  description: string;
  light_state: BulbSysinfoLightState;
  is_dimmable: 0 | 1;
  is_color: 0 | 1;
  is_variable_color_temp: 0 | 1;
  length?: number;
};

export interface BulbConstructorOptions extends DeviceConstructorOptions {
  sysInfo: BulbSysinfo;
}

interface BulbEvents {
  'emeter-realtime-update': (value: RealtimeNormalized) => void;
  /**
   * Bulb was turned on (`lightstate.on_off`).
   * @event Bulb#lightstate-on
   * @property {LightState} value lightstate
   */
  'lightstate-on': (value: LightState) => void;
  /**
   * Bulb was turned off (`lightstate.on_off`).
   * @event Bulb#lightstate-off
   * @property {LightState} value lightstate
   */
  'lightstate-off': (value: LightState) => void;
  /**
   * Bulb's lightstate was changed.
   * @event Bulb#lightstate-change
   * @property {LightState} value lightstate
   */
  'lightstate-change': (value: LightState) => void;
  /**
   * Bulb's lightstate was updated from device. Fired regardless if status was changed.
   * @event Bulb#lightstate-update
   * @property {LightState} value lightstate
   */
  'lightstate-update': (value: LightState) => void;
  /**
   * Bulb was turned on (`sysinfo.light_state.on_off`).
   * @event Bulb#lightstate-sysinfo-on
   * @property {BulbSysinfoLightState} value BulbSysinfoLightState
   */
  'lightstate-sysinfo-on': (value: BulbSysinfoLightState) => void;
  /**
   * Bulb was turned off (`sysinfo.light_state.on_off`).
   * @event Bulb#lightstate-sysinfo-off
   * @property {BulbSysinfoLightState} value BulbSysinfoLightState
   */
  'lightstate-sysinfo-off': (value: BulbSysinfoLightState) => void;
  /**
   * Bulb's lightstate (`sysinfo.light_state`) was changed.
   * @event Bulb#lightstate-sysinfo-change
   * @property {BulbSysinfoLightState} value BulbSysinfoLightState
   */
  'lightstate-sysinfo-change': (value: BulbSysinfoLightState) => void;
  /**
   * Bulb's lightstate (`sysinfo.light_state`) was updated from device. Fired regardless if status was changed.
   * @event Bulb#lightstate-sysinfo-update
   * @property {BulbSysinfoLightState} value BulbSysinfoLightState
   */
  'lightstate-sysinfo-update': (value: BulbSysinfoLightState) => void;
}

// TODO: Fix this
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
declare interface Bulb {
  on<U extends keyof BulbEvents>(event: U, listener: BulbEvents[U]): this;

  emit<U extends keyof BulbEvents>(
    event: U,
    ...args: Parameters<BulbEvents[U]>
  ): boolean;
}

/**
 * Bulb Device.
 *
 * @fires  Bulb#emeter-realtime-update
 * @fires  Bulb#lightstate-on
 * @fires  Bulb#lightstate-off
 * @fires  Bulb#lightstate-change
 * @fires  Bulb#lightstate-update
 * @fires  Bulb#lightstate-sysinfo-on
 * @fires  Bulb#lightstate-sysinfo-off
 * @fires  Bulb#lightstate-sysinfo-change
 * @fires  Bulb#lightstate-sysinfo-update
 */
// TODO: Fix this
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class Bulb extends Device {
  emitEventsEnabled = true;

  protected override _sysInfo: BulbSysinfo;

  /**
   * @internal
   */
  lastState = { powerOn: false, sysinfoLightState: {} };

  readonly supportsEmeter = true;

  readonly apiModules = {
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
  readonly lighting;

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

    this.apiModules = {
      system: 'smartlife.iot.common.system',
      cloud: 'smartlife.iot.common.cloud',
      schedule: 'smartlife.iot.common.schedule',
      timesetting: 'smartlife.iot.common.timesetting',
      emeter: 'smartlife.iot.common.emeter',
      netif: 'netif',
      lightingservice: isLightStrip(options.sysInfo)
        ? 'smartlife.iot.lightStrip'
        : 'smartlife.iot.smartbulb.lightingservice',
    };

    this.lighting = new Lighting(
      this,
      this.apiModules.lightingservice,
      isLightStrip(options.sysInfo)
        ? 'set_light_state'
        : 'transition_light_state',
    );

    this.setSysInfo(options.sysInfo);
    this._sysInfo = options.sysInfo;
  }

  /**
   * Returns cached results from last retrieval of `system.sysinfo`.
   * @returns system.sysinfo
   */
  override get sysInfo(): BulbSysinfo {
    return this._sysInfo;
  }

  /**
   * @internal
   */
  override setSysInfo(sysInfo: BulbSysinfo): void {
    super.setSysInfo(sysInfo);
    this.emitEvents();
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
  override get deviceType(): 'bulb' {
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
  get colorTemperatureRange(): { min: number; max: number } | null {
    if (!this.supportsColorTemperature) return null;

    const { model } = this.sysInfo;

    const k = TPLINK_KELVIN.find(([re]) => re.test(model));
    if (k != null) return { min: k[1], max: k[2] };
    return null;
  }

  /**
   * Gets bulb's SysInfo.
   *
   * Requests `system.sysinfo` from device.
   * @returns parsed JSON response
   */
  override async getSysInfo(sendOptions?: SendOptions): Promise<BulbSysinfo> {
    const response = await super.getSysInfo(sendOptions);

    if (!isBulbSysinfo(response)) {
      throw new Error(`Unexpected Response: ${JSON.stringify(response)}`);
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
      sendOptionsForGetInfo,
    );
    const data: unknown = JSON.parse(response);

    const sysinfo = extractResponse<BulbSysinfo>(
      data,
      'system.get_sysinfo',
      isBulbSysinfo,
    );
    this.setSysInfo(sysinfo);

    const cloudInfo = extractResponse<CloudInfo & HasErrCode>(
      data,
      [this.apiModules.cloud, 'get_info'],
      (c) => isCloudInfo(c) && hasErrCode(c),
    );
    this.cloud.info = cloudInfo;

    const emeterKey = this.apiModules.emeter;
    if (
      isObjectLike(data) &&
      objectHasKey(data, emeterKey) &&
      isObjectLike(data[emeterKey]) &&
      objectHasKey(data[emeterKey], 'get_realtime') &&
      // @ts-expect-error: limitation of TS type checking
      isObjectLike(data[emeterKey].get_realtime)
    ) {
      // @ts-expect-error: limitation of TS type checking
      const realtime = data[emeterKey].get_realtime as Realtime;
      this.emeter.setRealtime(realtime);
    }

    const scheduleNextAction = extractResponse<HasErrCode>(
      data,
      [this.apiModules.schedule, 'get_next_action'],
      hasErrCode,
    );
    this.schedule.nextAction = scheduleNextAction;

    const lightState = extractResponse<LightState>(
      data,
      [this.apiModules.lightingservice, 'get_light_state'],
      isLightState,
    );
    this.lighting.lightState = lightState;

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
    sendOptions?: SendOptions,
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

  /**
   * Blink Bulb.
   *
   * Sends `system.lighting.set_light_state` command alternating on at full brightness and off number of `times` at `rate`,
   * then sets the light state to its pre-blink state.
   * @throws {@link ResponseError}
   */
  async blink(
    times = 5,
    rate = 1000,
    sendOptions?: SendOptions,
  ): Promise<boolean> {
    const delay = (t: number): Promise<void> => {
      return new Promise((resolve) => {
        setTimeout(resolve, t);
      });
    };

    const origLightState = await this.lighting.getLightState(sendOptions);
    let lastBlink: number;

    let isBlinkOn = false;
    for (let i = 0; i < times * 2; i += 1) {
      isBlinkOn = !isBlinkOn;
      lastBlink = Date.now();

      const lightState: LightStateInput = isBlinkOn
        ? { on_off: 1, brightness: 100 }
        : { on_off: 0 };

      // eslint-disable-next-line no-await-in-loop
      await this.lighting.setLightState(lightState, sendOptions);

      const timeToWait = rate / 2 - (Date.now() - lastBlink);
      if (timeToWait > 0) {
        // eslint-disable-next-line no-await-in-loop
        await delay(timeToWait);
      }
    }
    const currLightState = await this.lighting.getLightState(sendOptions);
    if (currLightState !== origLightState) {
      await this.lighting.setLightState(origLightState, sendOptions);
    }
    return true;
  }

  private emitEvents(): void {
    if (!this.emitEventsEnabled) {
      return;
    }

    const { light_state: sysinfoLightState } = this._sysInfo;

    const powerOn = sysinfoLightState.on_off === 1;

    if (this.lastState.powerOn !== powerOn) {
      if (powerOn) {
        this.emit('lightstate-sysinfo-on', sysinfoLightState);
      } else {
        this.emit('lightstate-sysinfo-off', sysinfoLightState);
      }
    }

    if (!isEqual(this.lastState.sysinfoLightState, sysinfoLightState)) {
      this.emit('lightstate-sysinfo-change', sysinfoLightState);
    }
    this.emit('lightstate-sysinfo-update', sysinfoLightState);

    this.lastState.powerOn = powerOn;
    this.lastState.sysinfoLightState = sysinfoLightState;
  }
}

export default Bulb;
