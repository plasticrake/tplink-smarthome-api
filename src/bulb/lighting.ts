/* eslint-disable @typescript-eslint/camelcase */
import isEqual from 'lodash.isequal';
import type { SendOptions } from '../client';
import type Bulb from '.';
import {
  extractResponse,
  hasErrCode,
  isDefinedAndNotNull,
  isObjectLike,
} from '../utils';

export type LightState = {
  transition_period?: number;
  on_off?: 0 | 1;
  mode?: string;
  hue?: number;
  saturation?: number;
  brightness?: number;
  color_temp?: number;
  ignore_default?: 0 | 1;
  dft_on_state?: {
    mode?: string;
    hue?: number;
    saturation?: number;
    color_temp?: number;
    brightness?: number;
  };
};

export type LightStateInput = Omit<LightState, 'on_off' | 'ignore_default'> & {
  on_off?: boolean | 0 | 1;
  ignore_default?: boolean | 0 | 1;
};

export type LightStateResponse = LightState & {
  err_code: number;
};

export function isLightState(candidate: unknown): candidate is LightState {
  return isObjectLike(candidate);
}

export function isLightStateResponse(
  candidate: unknown
): candidate is LightStateResponse {
  return isObjectLike(candidate) && hasErrCode(candidate);
}

export default class Lighting {
  lastState: { powerOn?: boolean; lightState?: {} } = {
    powerOn: undefined,
    lightState: undefined,
  };

  #lightState: LightState = {};

  constructor(readonly device: Bulb, readonly apiModuleName: string) {}

  /**
   * Returns cached results from last retrieval of `lightingservice.get_light_state`.
   * @return {Object}
   */
  get lightState(): LightState {
    return this.#lightState;
  }

  /**
   * @private
   */
  set lightState(lightState) {
    this.#lightState = lightState;
    this.emitEvents();
  }

  /**
   * Bulb was turned on (`lightstate.on_off`).
   * @event Bulb#lightstate-on
   * @property {Object} value lightstate
   */
  /**
   * Bulb was turned off (`lightstate.on_off`).
   * @event Bulb#lightstate-off
   * @property {Object} value lightstate
   */
  /**
   * Bulb's lightstate was changed.
   * @event Bulb#lightstate-change
   * @property {Object} value lightstate
   */
  /**
   * Bulb's lightstate state was updated from device. Fired regardless if status was changed.
   * @event Bulb#lightstate-update
   * @property {Object} value lightstate
   */
  private emitEvents(): void {
    if (!this.#lightState) return;
    const powerOn = this.#lightState.on_off === 1;

    if (this.lastState.powerOn !== powerOn) {
      this.lastState.powerOn = powerOn;
      if (powerOn) {
        this.device.emit('lightstate-on', this.#lightState);
      } else {
        this.device.emit('lightstate-off', this.#lightState);
      }
    }

    if (!isEqual(this.lastState.lightState, this.#lightState)) {
      this.lastState.lightState = this.#lightState;
      this.device.emit('lightstate-change', this.#lightState);
    }
    this.device.emit('lightstate-update', this.#lightState);
  }

  /**
   * Get Bulb light state.
   *
   * Requests `lightingservice.get_light_state`.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async getLightState(sendOptions?: SendOptions): Promise<LightState> {
    this.lightState = extractResponse(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { get_light_state: {} },
        },
        undefined,
        sendOptions
      ),
      '',
      isLightStateResponse
    ) as LightStateResponse;

    return this.lightState;
  }

  /**
   * Sets Bulb light state (on/off, brightness, color, etc).
   *
   * Sends `lightingservice.transition_light_state` command.
   * @param  options
   * @param  options.transition_period (ms)
   * @param  options.on_off
   * @param  options.mode
   * @param  options.hue               0-360
   * @param  options.saturation        0-100
   * @param  options.brightness        0-100
   * @param  options.color_temp        Kelvin (LB120:2700-6500 LB130:2500-9000)
   * @param  options.ignore_default    default: true
   * @param  sendOptions
   */
  async setLightState(
    {
      transition_period,
      on_off,
      mode,
      hue,
      saturation,
      brightness,
      color_temp,
      ignore_default = true,
    }: LightStateInput,
    sendOptions?: SendOptions
  ): Promise<true> {
    const state: LightState = {};
    if (isDefinedAndNotNull(ignore_default))
      state.ignore_default = ignore_default ? 1 : 0;
    if (isDefinedAndNotNull(transition_period))
      state.transition_period = transition_period;
    if (isDefinedAndNotNull(on_off)) state.on_off = on_off ? 1 : 0;
    if (isDefinedAndNotNull(mode)) state.mode = mode;
    if (isDefinedAndNotNull(hue)) state.hue = hue;
    if (isDefinedAndNotNull(saturation)) state.saturation = saturation;
    if (isDefinedAndNotNull(brightness)) state.brightness = brightness;
    if (isDefinedAndNotNull(color_temp)) state.color_temp = color_temp;

    this.lightState = extractResponse(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { transition_light_state: state },
        },
        undefined,
        sendOptions
      ),
      '',
      isLightStateResponse
    ) as LightStateResponse;
    return true;
  }
}
