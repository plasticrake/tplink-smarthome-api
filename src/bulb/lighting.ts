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

export interface LightStripLightState {
  /**
   * (ms)
   */
  transition: number;
  length: number;
  on_off: 0 | 1;
  mode: string;
  /**
   * Start Index (inclusive), End Index (inclusive), Hue, Saturation, Brightness, Color Temp (Kelvin)
   */
  groups: Array<[number, number, number, number, number, number]>;
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
  candidate: unknown,
): candidate is LightStateResponse {
  return isObjectLike(candidate) && hasErrCode(candidate);
}

export default class Lighting {
  /**
   * @internal
   */
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
    private readonly apiModuleName: string,
    private readonly setLightStateMethodName: string,
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
    if (!this.#lightState) return;
    const powerOn = this.#lightState.on_off === 1;

    if (this.lastState.powerOn !== powerOn) {
      if (powerOn) {
        this.device.emit('lightstate-on', this.#lightState);
      } else {
        this.device.emit('lightstate-off', this.#lightState);
      }
    }

    if (!isEqual(this.lastState.lightState, this.#lightState)) {
      this.device.emit('lightstate-change', this.#lightState);
    }
    this.device.emit('lightstate-update', this.#lightState);

    this.lastState.powerOn = powerOn;
    this.lastState.lightState = this.#lightState;
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
        sendOptions,
      ),
      '',
      isLightStateResponse,
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
    sendOptions?: SendOptions,
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

    const response = extractResponse(
      await this.device.sendCommand(
        {
          [this.apiModuleName]: { [this.setLightStateMethodName]: state },
        },
        undefined,
        sendOptions,
      ),
      '',
      isLightStateResponse,
    ) as LightStateResponse;

    // The light strip in particular returns more detail with get(), so only
    // apply the subset that is returned with set()
    this.lightState = { ...this.lightState, ...response };

    return true;
  }

  /**
   * Get Bulb light details.
   *
   * Requests `lightingservice.get_light_details`.
   * @returns parsed JSON response
   * @throws {@link ResponseError}
   */
  async getLightDetails(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: { get_light_details: {} },
      },
      undefined,
      sendOptions,
    );
  }
}
