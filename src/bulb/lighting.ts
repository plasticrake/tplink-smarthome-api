import isEqual from 'lodash.isequal';
import type { SendOptions } from '../client';
import type Bulb from '.';
import {
  extractResponse,
  hasErrCode,
  isDefinedAndNotNull,
  isObjectLike,
} from '../utils';

export interface LightState {
  /**
   * (ms)
   */
  transition_period?: number;
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
   * (LB120:2700-6500 LB130:2500-9000)
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

export interface LightStateInput extends LightState {
  /**
   * @defaultValue 1
   */
  ignore_default?: 0 | 1;
}

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
  lastState: { powerOn?: boolean; lightState?: LightState } = {
    powerOn: undefined,
    lightState: undefined,
  };

  /**
   * @internal
   */
  #lightState: LightState = {};

  constructor(
    private readonly device: Bulb,

    private readonly apiModuleName: string
  ) {}

  /**
   * Returns cached results from last retrieval of `lightingservice.get_light_state`.
   * @returns cached results from last retrieval of `lightingservice.get_light_state`.
   */
  get lightState(): LightState {
    return this.#lightState;
  }

  /**
   * @internal
   */
  set lightState(lightState: LightState) {
    this.#lightState = lightState;
    this.emitEvents();
  }

  private emitEvents(): void {
    /**
     * Bulb was turned on (`lightstate.on_off`).
     * @event Bulb#lightstate-on
     * @property {object} value lightstate
     */
    /**
     * Bulb was turned off (`lightstate.on_off`).
     * @event Bulb#lightstate-off
     * @property {object} value lightstate
     */
    /**
     * Bulb's lightstate was changed.
     * @event Bulb#lightstate-change
     * @property {object} value lightstate
     */
    /**
     * Bulb's lightstate state was updated from device. Fired regardless if status was changed.
     * @event Bulb#lightstate-update
     * @property {object} value lightstate
     */

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
   * @returns parsed JSON response
   * @throws {@link ResponseError}
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
   * @param  lightState - light state
   * @param  sendOptions - send options
   */
  async setLightState(
    lightState: LightStateInput,
    sendOptions?: SendOptions
  ): Promise<true> {
    const {
      /* eslint-disable @typescript-eslint/naming-convention */
      transition_period,
      on_off,
      mode,
      hue,
      saturation,
      brightness,
      color_temp,
      ignore_default = 1,
      /* eslint-enable @typescript-eslint/naming-convention */
    } = lightState;
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
