'use strict';

const Device = require('./device');

class Plug extends Device {
  constructor (options) {
    super(options);
    if (typeof options === 'undefined') options = {};

    this.log.debug('plug.constructor()');

    this.inUseThreshold = options.inUseThreshold || 0;

    this.lastState = Object.assign(this.lastState, { powerOn: null, inUse: null });

    this._consumption = {};

    this.emitEventsEnabled = true;
  }

  memoize (maxAge = 5000) {
    super.memoize(maxAge);
    this.log.debug('[%s] plug.memoize(%d)', this.name, maxAge);
    const memoize = require('memoizee');

    this.getInUse = memoize(this.getInUse.bind(this), { promise: true, maxAge: maxAge });
    this.getInfo = memoize(this.getInfo.bind(this), { promise: true, maxAge: maxAge });
    this.getSysInfoAndConsumption = memoize(this.getSysInfoAndConsumption.bind(this), { promise: true, maxAge: maxAge });
    this.getPowerState = memoize(this.getPowerState.bind(this), { promise: true, maxAge: maxAge });
    this.getLedState = memoize(this.getLedState.bind(this), { promise: true, maxAge: maxAge });
    this.getConsumption = memoize(this.getConsumption.bind(this), { promise: true, maxAge: maxAge });

    // Invalidate cache on change
    const wrap = require('lodash.wrap');
    this.setPowerState = wrap(this.setPowerState, (fn, ...args) => {
      this.log.debug('[%s] plug.memoize setPowerState clearing cache', this.name);
      this.getPowerState.clear();
      this.getSysInfo.clear();
      return fn.bind(this)(...args);
    });
    this.setLedState = wrap(this.setLedState, (fn, ...args) => {
      this.log.debug('[%s] plug.memoize setLedState clearing cache', this.name);
      this.getLedState.clear();
      this.getSysInfo.clear();
      return fn.bind(this)(...args);
    });
  }

  get sysInfo () {
    return super.sysInfo;
  }

  set sysInfo (sysInfo) {
    super.sysInfo = sysInfo;
    this.log.debug('[%s] plug sysInfo set', this.name);
    this.emitEvents();
  }

  get consumption () { return this._consumption; }

  set consumption (consumption) {
    this.log.debug('[%s] plug consumption set', this.name);
    this._consumption = consumption;
    if (this.supportsConsumption) {
      this.emitEvents();
    }
  }

  get inUse () {
    if (this.supportsConsumption) {
      return (this.consumption.power > this.inUseThreshold);
    } else {
      return (this.sysInfo.relay_state === 1);
    }
  }

  async getInUse () {
    if (this.supportsConsumption) {
      let consumption = await this.getConsumption();
      return (consumption.power > this.inUseThreshold);
    } else {
      let si = await this.getSysInfo();
      return (si.relay_state === 1);
    }
  }

  emitEvents () {
    if (!this.emitEventsEnabled) { return; }

    const inUse = this.inUse;
    const powerOn = (this.sysInfo.relay_state === 1);

    this.log.debug('[%s] plug.emitEvents() inUse: %s powerOn: %s lastState: %j', this.name, inUse, powerOn, this.lastState);
    if (this.lastState.inUse !== inUse) {
      this.lastState.inUse = inUse;
      if (inUse) {
        this.emit('in-use', this);
      } else {
        this.emit('not-in-use', this);
      }
    }

    if (this.lastState.powerOn !== powerOn) {
      this.lastState.powerOn = powerOn;
      if (powerOn) {
        this.emit('power-on', this);
      } else {
        this.emit('power-off', this);
      }
    }
  }

  async getInfo () {
    let data = await this.send('{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}');
    this.sysInfo = data.system.get_sysinfo;
    this.cloudInfo = data.cnCloud.get_info;
    this.consumption = data.emeter;
    this.scheduleNextAction = data.schedule.get_next_action;
    return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, consumption: this.consumption, scheduleNextAction: this.scheduleNextAction};
  }

  async getSysInfoAndConsumption () {
    let data = await this.send('{"emeter":{"get_realtime":{}},"system":{"get_sysinfo":{}}}');
    this.sysInfo = data.system.get_sysinfo;
    this.consumption = data.emeter;
    return {sysInfo: this.sysInfo, consumption: this.consumption};
  }

  async getCloudInfo () {
    let data = await this.send('{"cnCloud":{"get_info":{}}}');
    this.cloudInfo = data.cnCloud.get_info;
    return this.cloudInfo;
  }

  async getScheduleNextAction () {
    let data = await this.send('{"schedule":{"get_next_action":{}}}');
    return data.schedule.get_next_action;
  }

  async getScheduleRules () {
    let data = await this.send('{"schedule":{"get_rules":{}}}');
    return data.schedule.get_rules;
  }

  async getAwayRules () {
    let data = await this.send('{"anti_theft":{"get_rules":{}}}');
    return data.anti_theft.get_rules;
  }

  async getTimerRules () {
    let data = await this.send('{"count_down":{"get_rules":{}}}');
    return data.count_down.get_rules;
  }

  async getTime () {
    let data = await this.send('{"time":{"get_time":{}}}');
    return data.time.get_time;
  }

  async getTimeZone () {
    let data = await this.send('{"time":{"get_timezone":{}}}');
    return data.time.get_timezone;
  }

  async getScanInfo (refresh = false, timeoutInSeconds = 10) {
    let timeout = (timeoutInSeconds * 1000) + this.timeout; // add original timeout to wait for response
    let data = await this.send(`{"netif":{"get_scaninfo":{"refresh":${(refresh ? 1 : 0)},"timeout":${timeoutInSeconds}}}}`, timeout);
    return data.netif.get_scaninfo;
  }

  async getPowerState () {
    let sysInfo = await this.getSysInfo();
    return (sysInfo.relay_state === 1);
  }

  async setPowerState (value) {
    this.log.debug('[%s] plug.setPowerState(%s)', this.name, value);
    let data = await this.send(`{"system":{"set_relay_state":{"state":${(value ? 1 : 0)}}}}`);
    let errCode;
    try {
      errCode = data.system.set_relay_state.err_code;
      if (errCode === 0) { this.sysInfo.relay_state = (value ? 1 : 0); }
      this.emitEvents();
      return (errCode === 0);
    } catch (e) {}
    if (errCode !== 0) { throw data; }
  }

  async getLedState () {
    let sysInfo = await this.getSysInfo();
    return (sysInfo.led_off === 0);
  }

  async setLedState (value) {
    let data = await this.send(`{"system":{"set_led_off":{"off":${(value ? 0 : 1)}}}}`);
    let errCode;
    try {
      errCode = data.system.set_led_off.err_code;
      if (errCode === 0) { this.sysInfo.set_led_off = (value ? 0 : 1); }
      return (errCode === 0);
    } catch (e) {}
    if (errCode !== 0) { throw data; }
  }

  async getConsumption () {
    let data = await this.send('{"emeter":{"get_realtime":{}}}');
    this.consumption = data.emeter.get_realtime;
    return this.consumption;
  }

  async setAlias (value) {
    let data = await this.send(`{"system":{"set_dev_alias":{"alias":"${(value)}"}}}`);
    let errCode;
    try {
      errCode = data.system.set_dev_alias.err_code;
      if (errCode === 0) { this.sysInfo.alias = value; }
      return (errCode === 0);
    } catch (e) {}
    if (errCode !== 0) { throw data; }
  }

  async blink (times = 5, rate = 1000) {
    let delay = (t) => { return new Promise((resolve) => { setTimeout(resolve, t); }); };

    let origLedState = await this.getLedState();
    let lastBlink = Date.now();

    let currLedState = false;
    for (var i = 0; i < times * 2; i++) {
      currLedState = !currLedState;
      lastBlink = Date.now();
      await this.setLedState(currLedState);
      let timeToWait = (rate / 2) - (Date.now() - lastBlink);
      if (timeToWait > 0) {
        await delay(timeToWait);
      }
    }
    if (currLedState !== origLedState) {
      await this.setLedState(origLedState);
    }
  }
}

module.exports = Plug;
