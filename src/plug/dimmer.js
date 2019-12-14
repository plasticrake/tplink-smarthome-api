'use strict';

/**
 * Dimmer
 *
 * TP-Link models: HS220.
 */
class Dimmer {
  constructor (device, apiModuleName) {
    this.device = device;
    this.apiModuleName = apiModuleName;
  }

  /**
   * Sets Plug to the specified `brightness`.
   *
   * Sends `dimmer.set_brightness` command. Does not support childId.
   * @param  {Boolean}     brightness  0-100
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setBrightness (brightness, sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_brightness: { brightness }
      }
    }, null, sendOptions);
  }

  /**
   * Get Plug/Dimmer default behavior configuration.
   *
   * Requests `dimmer.get_default_behavior`. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async getDefaultBehavior (sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        get_default_behavior: {}
      }
    }, null, sendOptions);
  }

  /**
   * Get Plug/Dimmer parameters configuration.
   *
   * Requests `dimmer.get_dimmer_parameters`. Does not support childId.
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async getDimmerParameters (sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        get_dimmer_parameters: {}
      }
    }, null, sendOptions);
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
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setDimmerTransition ({ brightness, mode, duration }, sendOptions = {}) {
    const transition = {};

    if (brightness !== undefined) transition.brightness = brightness;
    if (mode !== undefined) transition.mode = mode;
    if (duration !== undefined) transition.duration = duration;

    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_dimmer_transition: transition
      }
    }, null, sendOptions);
  }

  /**
   * Set Plug/Dimmer `default_behavior` configuration for `double_click`.
   *
   * Sends `dimmer.set_double_click_action`. Does not support childId.
   * @param  {Object}       options
   * @param  {string}      [options.mode]
   * @param  {number}      [options.index]
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setDoubleClickAction ({ mode, index }, sendOptions = {}) {
    return this.setAction({ actionName: 'set_double_click_action', mode, index });
  }

  /**
   * @private
   */
  async setAction ({ actionName, mode, index }, sendOptions = {}) {
    const action = {};
    if (mode !== undefined) action.mode = mode;
    if (index !== undefined) action.index = index;

    return this.device.sendCommand({
      [this.apiModuleName]: {
        [actionName]: action
      }
    }, null, sendOptions);
  }

  /**
   * Set Plug `dimmer_parameters` for `fadeOffTime`.
   *
   * Sends `dimmer.set_fade_off_time`. Does not support childId.
   * @param  {number} duration  duration in ms
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setFadeOffTime (fadeTime, sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_fade_off_time: { fadeTime }
      }
    }, null, sendOptions);
  }

  /**
   * Set Plug `dimmer_parameters` for `fadeOnTime`.
   *
   * Sends `dimmer.set_fade_on_time`. Does not support childId.
   * @param  {number} fadeTime  duration in ms
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setFadeOnTime (fadeTime, sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_fade_on_time: { fadeTime }
      }
    }, null, sendOptions);
  }

  /**
   * Set Plug `dimmer_parameters` for `gentleOffTime`.
   *
   * Sends `dimmer.set_gentle_off_time`. Does not support childId.
   * @param  {number} fadeTime  duration in ms
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setGentleOffTime (fadeTime, sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_gentle_off_time: { fadeTime }
      }
    }, null, sendOptions);
  }

  /**
   * Set Plug `dimmer_parameters` for `gentleOnTime`.
   *
   * Sends `dimmer.set_gentle_on_time`. Does not support childId.
   * @param  {number} fadeTime  duration in ms
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setGentleOnTime (fadeTime, sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_gentle_on_time: { fadeTime }
      }
    }, null, sendOptions);
  }

  /**
   * Set Plug/Dimmer `default_behavior` configuration for `long_press`.
   *
   * Sends `dimmer.set_long_press_action`. Does not support childId.
   * @param  {Object}       options
   * @param  {string}      [options.mode]
   * @param  {number}      [options.index]
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<boolean, ResponseError>}
   */
  async setLongPressAction ({ mode, index }, sendOptions = {}) {
    return this.setAction({ actionName: 'set_long_press_action', mode, index });
  }

  /**
   * Sets Plug to the specified on/off state.
   *
   * Sends `dimmer.set_switch_state` command. Does not support childId.
   * @param  {Boolean}     state  true=on, false=off
   * @param  {SendOptions} [sendOptions]
   * @return {Promise<Object, ResponseError>} parsed JSON response
   */
  async setSwitchState (state, sendOptions = {}) {
    return this.device.sendCommand({
      [this.apiModuleName]: {
        set_switch_state: { state: (state ? 1 : 0) }
      }
    }, null, sendOptions);
  }
}

module.exports = Dimmer;
