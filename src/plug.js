'use strict';

const Device = require('./device');

class Plug extends Device {
  constructor (options) {
    super(options);
    if (typeof options === 'undefined') options = {};

    this.log.debug('plug.constructor()');

    this.apiModuleNamespace = {
      'system': 'system',
      'cloud': 'cnCloud',
      'schedule': 'schedule',
      'timesetting': 'time',
      'emeter': 'emeter',
      'netif': 'netif'
    };

    this.inUseThreshold = options.inUseThreshold || 0;

    this.lastState = Object.assign(this.lastState, { powerOn: null, inUse: null });

    this.emitEventsEnabled = true;
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
    }
    let si = await this.getSysInfo();
    return (si.relay_state === 1);
  }

  emitEvents () {
    if (!this.emitEventsEnabled) { return; }

    const inUse = this.inUse;
    const powerOn = (this.sysInfo.relay_state === 1);

    this.log.debug('[%s] plug.emitEvents() inUse: %s powerOn: %s lastState: %j', this.name, inUse, powerOn, this.lastState);
    if (this.lastState.inUse !== inUse) {
      this.lastState.inUse = inUse;
      if (inUse) {
        this.emit('in-use', this, inUse);
      } else {
        this.emit('not-in-use', this, inUse);
      }
    } else {
      this.emit('in-use-update', this, inUse);
    }

    if (this.lastState.powerOn !== powerOn) {
      this.lastState.powerOn = powerOn;
      if (powerOn) {
        this.emit('power-on', this, powerOn);
      } else {
        this.emit('power-off', this, powerOn);
      }
    } else {
      this.emit('power-update', this, powerOn);
    }

    if (this.supportsConsumption) {
      this.emit('consumption-update', this, this.consumption);
    }
  }

  async getInfo () {
    let data = await this.send('{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}');
    this.sysInfo = data.system.get_sysinfo;
    this.cloudInfo = data.cnCloud.get_info;
    this.consumption = data.emeter.get_realtime;
    this.scheduleNextAction = data.schedule.get_next_action;
    return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, consumption: this.consumption, scheduleNextAction: this.scheduleNextAction};
  }

  async getSysInfoAndConsumption () {
    let data = await this.sendCommand('{"emeter":{"get_realtime":{}},"system":{"get_sysinfo":{}}}');
    this.sysInfo = data.system.get_sysinfo;
    this.consumption = data.emeter.get_realtime;
    return {sysInfo: this.sysInfo, consumption: this.consumption};
  }

  async getPowerState () {
    let sysInfo = await this.getSysInfo();
    return (sysInfo.relay_state === 1);
  }

  async setPowerState (value) {
    this.log.debug('[%s] plug.setPowerState(%s)', this.name, value);
    await this.sendCommand(`{"system":{"set_relay_state":{"state":${(value ? 1 : 0)}}}}`);
    this.sysInfo.relay_state = (value ? 1 : 0);
    this.emitEvents();
    return true;
  }

  async getAwayRules () {
    return this.sendCommand(`{"anti_theft":{"get_rules":{}}}`);
  }

  async getTimerRules () {
    return this.sendCommand(`{"count_down":{"get_rules":{}}}`);
  }

  async getLedState () {
    let sysInfo = await this.getSysInfo();
    return (sysInfo.led_off === 0);
  }

  async setLedState (value) {
    await this.sendCommand(`{"system":{"set_led_off":{"off":${(value ? 0 : 1)}}}}`);
    this.sysInfo.set_led_off = (value ? 0 : 1);
    return true;
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
    return true;
  }
}

module.exports = Plug;
