'use strict';

const Device = require('./device');

class Plug extends Device {
  constructor (options) {
    super(options);
    if (typeof options === 'undefined') options = {};

    this.inUseThreshold = options.inUseThreshold || 0;

    this.lastState = { powerOn: null, inUse: null };

    this._consumption = {};

    if (options.sysInfo) { this.sysInfo = options.sysInfo; }
  }

  get sysInfo () {
    return super.sysInfo;
  }

  set sysInfo (sysInfo) {
    super.sysInfo = sysInfo;
    try {
      this.supportsConsumption = (sysInfo.feature.includes('ENE'));
    } catch (e) {
      this.supportsConsumption = false;
    }
    this.emitEvents();
  }

  get consumption () { return this._consumption; }

  set consumption (consumption) {
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

  getInUse () {
    if (this.supportsConsumption) {
      return this.getConsumption().then((consumption) => {
        return (consumption.power > this.inUseThreshold);
      });
    } else {
      return this.getSysInfo().then((si) => {
        return (si.relay_state === 1);
      });
    }
  }

  emitEvents () {
    super.emitEvents();
    const inUse = this.inUse;
    const powerOn = (this.sysInfo.relay_state === 1);

    this.log.debug('[%s] emitEvents() inUse: %s powerOn: %s lastState: %j', this.name, inUse, powerOn, this.lastState);

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

  getInfo () {
    return this.send('{"emeter":{"get_realtime":{}},"schedule":{"get_next_action":{}},"system":{"get_sysinfo":{}},"cnCloud":{"get_info":{}}}').then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      this.cloudInfo = data.cnCloud.get_info;
      this.consumption = data.emeter;
      this.scheduleNextAction = data.schedule.get_next_action;
      return {sysInfo: this.sysInfo, cloudInfo: this.cloudInfo, consumption: this.consumption, scheduleNextAction: this.scheduleNextAction};
    });
  }

  getSysInfoAndConsumption () {
    return this.send('{"emeter":{"get_realtime":{}},"system":{"get_sysinfo":{}}}').then((data) => {
      this.sysInfo = data.system.get_sysinfo;
      this.consumption = data.emeter;
      return {sysInfo: this.sysInfo, consumption: this.consumption};
    });
  }

  getCloudInfo () {
    return this.send('{"cnCloud":{"get_info":{}}}').then((data) => {
      this.cloudInfo = data.cnCloud.get_info;
      return this.cloudInfo;
    });
  }

  getScheduleNextAction () {
    return this.send('{"schedule":{"get_next_action":{}}}').then((data) => {
      return data.schedule.get_next_action;
    });
  }

  getScheduleRules () {
    return this.send('{"schedule":{"get_rules":{}}}').then((data) => {
      return data.schedule.get_rules;
    });
  }

  getAwayRules () {
    return this.send('{"anti_theft":{"get_rules":{}}}').then((data) => {
      return data.anti_theft.get_rules;
    });
  }

  getTimerRules () {
    return this.send('{"count_down":{"get_rules":{}}}').then((data) => {
      return data.count_down.get_rules;
    });
  }

  getTime () {
    return this.send('{"time":{"get_time":{}}}').then((data) => {
      return data.time.get_time;
    });
  }

  getTimeZone () {
    return this.send('{"time":{"get_timezone":{}}}').then((data) => {
      return data.time.get_timezone;
    });
  }

  getScanInfo (refresh = false, timeoutInSeconds = 10) {
    let timeout = (timeoutInSeconds * 1000) + this.timeout; // add original timeout to wait for response
    return this.send(`{"netif":{"get_scaninfo":{"refresh":${(refresh ? 1 : 0)},"timeout":${timeoutInSeconds}}}}`, timeout).then((data) => {
      return data.netif.get_scaninfo;
    });
  }

  getPowerState () {
    return this.getSysInfo().then((sysInfo) => {
      return (sysInfo.relay_state === 1);
    });
  }

  setPowerState (value) {
    return this.send(`{"system":{"set_relay_state":{"state":${(value ? 1 : 0)}}}}`).then((data) => {
      let errCode;
      try {
        errCode = data.system.set_relay_state.err_code;
        if (errCode === 0) { this.sysInfo.relay_state = (value ? 1 : 0); }
        this.emitEvents();
        return (errCode === 0);
      } catch (e) {}
      if (errCode !== 0) { throw data; }
    });
  }

  getLedState () {
    return this.getSysInfo().then((sysInfo) => {
      return (sysInfo.led_off === 0);
    });
  }

  setLedState (value) {
    return this.send(`{"system":{"set_led_off":{"off":${(value ? 0 : 1)}}}}`).then((data) => {
      let errCode;
      try {
        errCode = data.system.set_led_off.err_code;
        if (errCode === 0) { this.sysInfo.set_led_off = (value ? 0 : 1); }
        return (errCode === 0);
      } catch (e) {}
      if (errCode !== 0) { throw data; }
    });
  }

  getConsumption () {
    return this.send('{"emeter":{"get_realtime":{}}}').then((data) => {
      this.consumption = data.emeter.get_realtime;
      return this.consumption;
    });
  }

  blink (times = 5, rate = 1000) {
    return new Promise((resolve, reject) => {
      let origLedState;
      let currLedState;

      let delay = (t) => { return new Promise((resolve) => { setTimeout(resolve, t); }); };

      let chain = this.getLedState().then((value) => {
        origLedState = value;
      });

      let promises = [];
      for (let i = 0; i < times; i++) {
        let chainOn = chain.then(() => { return delay(rate * (i * 2)); })
        .then(() => {
          return this.setLedState(true).then((success) => {
            if (success) { currLedState = true; }
          });
        });
        let chainOff = chain.then(() => { return delay(rate * ((i * 2) + 1)); })
        .then(() => {
          return this.setLedState(false).then((success) => {
            if (success) { currLedState = false; }
          });
        });
        promises.push(chainOn, chainOff);
      }

      Promise.all(promises).then(() => {
        if (currLedState !== origLedState) {
          return this.setLedState(origLedState);
        }
      }).then(() => {
        resolve(true);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = Plug;
