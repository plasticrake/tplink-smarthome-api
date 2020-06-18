import type { SendOptions } from '../client';
import type Plug from '.';

/**
 * Dimmer
 *
 * TP-Link models: HS220.
 */
export default class Dimmer {
  constructor(readonly device: Plug, readonly apiModuleName: string) {}

  /**
   * Sets Plug to the specified `brightness`.
   *
   * Sends `dimmer.set_brightness` command. Does not support childId.
   * @param  brightness  0-100
   * @param  sendOptions
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async setBrightness(
    brightness: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_brightness: { brightness },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Get Plug/Dimmer default behavior configuration.
   *
   * Requests `dimmer.get_default_behavior`. Does not support childId.
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async getDefaultBehavior(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          get_default_behavior: {},
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Get Plug/Dimmer parameters configuration.
   *
   * Requests `dimmer.get_dimmer_parameters`. Does not support childId.
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async getDimmerParameters(sendOptions?: SendOptions): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          get_dimmer_parameters: {},
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Transitions Plug to the specified `brightness`.
   *
   * Sends `dimmer.set_dimmer_transition` command. Does not support childId.
   * @param  {Object}       options
   * @param  {Boolean}     [options.brightness]  0-100
   * @param  {number}      [options.mode]        "gentle_on_off", etc.
   * @param  {number}      [options.duration]    duration in seconds
   * @param  {SendOptions} [sendOptions]
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async setDimmerTransition(
    {
      brightness,
      mode,
      duration,
    }: { brightness?: number; mode?: string; duration?: number },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_dimmer_transition: {
            brightness,
            mode,
            duration,
          },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Set Plug/Dimmer `default_behavior` configuration for `double_click`.
   *
   * Sends `dimmer.set_double_click_action`. Does not support childId.
   * @param  {Object}       options
   * @param  {string}      [options.mode]
   * @param  {number}      [options.index]
   * @param  {SendOptions} [sendOptions]
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async setDoubleClickAction(
    { mode, index }: { mode?: string; index?: number },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.setAction(
      {
        actionName: 'set_double_click_action',
        mode,
        index,
      },
      sendOptions
    );
  }

  private async setAction(
    {
      actionName,
      mode,
      index,
    }: {
      actionName: string;
      mode?: string;
      index?: number;
    },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          [actionName]: { mode, index },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Set Plug `dimmer_parameters` for `fadeOffTime`.
   *
   * Sends `dimmer.set_fade_off_time`. Does not support childId.
   * @param   fadeTime - duration in ms
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws  ResponseError
   */
  async setFadeOffTime(
    fadeTime: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_fade_off_time: { fadeTime },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Set Plug `dimmer_parameters` for `fadeOnTime`.
   *
   * Sends `dimmer.set_fade_on_time`. Does not support childId.
   * @param   fadeTime - duration in ms
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws  ResponseError
   */
  async setFadeOnTime(
    fadeTime: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_fade_on_time: { fadeTime },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Set Plug `dimmer_parameters` for `gentleOffTime`.
   *
   * Sends `dimmer.set_gentle_off_time`. Does not support childId.
   * @param   fadeTime - duration in ms
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws  ResponseError
   */
  async setGentleOffTime(
    fadeTime: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_gentle_off_time: { fadeTime },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Set Plug `dimmer_parameters` for `gentleOnTime`.
   *
   * Sends `dimmer.set_gentle_on_time`. Does not support childId.
   * @param   fadeTime - duration in ms
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws  ResponseError
   */
  async setGentleOnTime(
    fadeTime: number,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_gentle_on_time: { fadeTime },
        },
      },
      undefined,
      sendOptions
    );
  }

  /**
   * Set Plug/Dimmer `default_behavior` configuration for `long_press`.
   *
   * Sends `dimmer.set_long_press_action`. Does not support childId.
   * @param   options
   * @param   options.mode
   * @param   options.index
   * @param   sendOptions
   * @returns parsed JSON response
   * @throws  ResponseError
   */
  async setLongPressAction(
    { mode, index }: { mode: string; index: number },
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.setAction(
      { actionName: 'set_long_press_action', mode, index },
      sendOptions
    );
  }

  /**
   * Sets Plug to the specified on/off state.
   *
   * Sends `dimmer.set_switch_state` command. Does not support childId.
   * @param  {Boolean}     state  true=on, false=off
   * @param  {SendOptions} [sendOptions]
   * @returns parsed JSON response
   * @throws ResponseError
   */
  async setSwitchState(
    state: boolean | 0 | 1,
    sendOptions?: SendOptions
  ): Promise<unknown> {
    return this.device.sendCommand(
      {
        [this.apiModuleName]: {
          set_switch_state: { state: state ? 1 : 0 },
        },
      },
      undefined,
      sendOptions
    );
  }
}
