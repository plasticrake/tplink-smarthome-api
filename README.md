<!-- markdownlint-disable MD007 MD012 MD033 -->

# tplink-smarthome-api

[![NPM Version](https://img.shields.io/npm/v/tplink-smarthome-api.svg)](https://www.npmjs.com/package/tplink-smarthome-api)
[![Build Status](https://travis-ci.org/plasticrake/tplink-smarthome-api.svg?branch=master)](https://travis-ci.org/plasticrake/tplink-smarthome-api)
[![codecov](https://codecov.io/gh/plasticrake/tplink-smarthome-api/branch/master/graph/badge.svg)](https://codecov.io/gh/plasticrake/tplink-smarthome-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TP-Link Smart Home API

**[Changelog](https://github.com/plasticrake/tplink-smarthome-api/tree/master/CHANGELOG.md)**

## Supported Devices

| Model                                     | Type |
|-------------------------------------------|------|
| HS100, HS103, HS105, HS107, HS110,<br/>HS200, HS210, HS220, HS300, KP303, KP400 | Plug |
| LB100, LB110, LB120, LB130, LB200, LB230  | Bulb |


## Related Projects

* [TP-Link Smarthome Device Simulator](https://github.com/plasticrake/tplink-smarthome-simulator) - Useful for automated testing
* [TP-Link Smarthome Crypto](https://github.com/plasticrake/tplink-smarthome-crypto)
* [TP-Link Smarthome Homebridge Plugin](https://github.com/plasticrake/homebridge-tplink-smarthome)

## Examples

See more [examples](https://github.com/plasticrake/tplink-smarthome-api/tree/master/examples).

```javascript
const { Client } = require('tplink-smarthome-api');

const client = new Client();
const plug = client.getDevice({host: '10.0.1.2'}).then((device)=>{
  device.getSysInfo().then(console.log);
  device.setPowerState(true);
});

// Look for devices, log to console, and turn them on
client.startDiscovery().on('device-new', (device) => {
  device.getSysInfo().then(console.log);
  device.setPowerState(true);
});
```

## CLI

Install the command line utility with `npm install -g tplink-smarthome-api`. Run `tplink-smarthome-api --help` for help.

## API

[Full API docs can be found here.](https://github.com/plasticrake/tplink-smarthome-api/blob/master/API.md)

For functions that send commands, the last argument is `SendOptions` where you can set the `transport` ('tcp','udp') and `timeout`.

Functions that take more than 3 arguments are passed a single options object as the first argument (and if its a network command, SendOptions as the second.)
<!-- markdownlint-disable MD004 MD007 MD009 MD012 MD022 MD024 MD032 MD033 -->

* [Client](#Client) ⇐ <code>EventEmitter</code>
    * [new Client(options)](#new_Client_new)
    * [.send(payload, host, [port], [sendOptions])](#Client+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getSysInfo(host, [port], [sendOptions])](#Client+getSysInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getBulb(deviceOptions)](#Client+getBulb) ⇒ [<code>Bulb</code>](#Bulb)
    * [.getPlug(deviceOptions)](#Client+getPlug) ⇒ [<code>Plug</code>](#Plug)
    * [.getDevice(deviceOptions, [sendOptions])](#Client+getDevice) ⇒ <code>Promise.&lt;(Plug\|Bulb), Error&gt;</code>
    * [.getCommonDevice(deviceOptions)](#Client+getCommonDevice) ⇒ [<code>Device</code>](#Device)
    * [.getDeviceFromSysInfo(sysInfo, deviceOptions)](#Client+getDeviceFromSysInfo) ⇒ [<code>Plug</code>](#Plug) \| [<code>Bulb</code>](#Bulb)
    * [.getTypeFromSysInfo(sysInfo)](#Client+getTypeFromSysInfo) ⇒ <code>string</code>
    * [.startDiscovery(options)](#Client+startDiscovery) ⇒ [<code>Client</code>](#Client)
    * [.stopDiscovery()](#Client+stopDiscovery)
    * ["device-new"](#Client+event_device-new)
    * ["device-online"](#Client+event_device-online)
    * ["device-offline"](#Client+event_device-offline)
    * ["bulb-new"](#Client+event_bulb-new)
    * ["bulb-online"](#Client+event_bulb-online)
    * ["bulb-offline"](#Client+event_bulb-offline)
    * ["plug-new"](#Client+event_plug-new)
    * ["plug-online"](#Client+event_plug-online)
    * ["plug-offline"](#Client+event_plug-offline)
    * ["discovery-invalid"](#Client+event_discovery-invalid)
    * ["error"](#Client+event_error)



* [Bulb](#Bulb) ⇐ [<code>Device</code>](#Device)
    * [new Bulb(options)](#new_Bulb_new)
    * [.cloud](#Bulb+cloud)
        * [.getInfo([sendOptions])](#Bulb+cloud+getInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.bind(username, password, [sendOptions])](#Bulb+cloud+bind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.unbind([sendOptions])](#Bulb+cloud+unbind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getFirmwareList([sendOptions])](#Bulb+cloud+getFirmwareList) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setServerUrl(server, [sendOptions])](#Bulb+cloud+setServerUrl) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.emeter](#Bulb+emeter)
        * [.realtime](#Bulb+emeter+realtime) ⇒ <code>Object</code>
        * [.getRealtime([sendOptions])](#Bulb+emeter+getRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getDayStats(year, month, [sendOptions])](#Bulb+emeter+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getMonthStats(year, [sendOptions])](#Bulb+emeter+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.eraseStats([sendOptions])](#Bulb+emeter+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.lighting](#Bulb+lighting)
        * [.lightState](#Bulb+lighting+lightState) ⇒ <code>Object</code>
        * [.getLightState([sendOptions])](#Bulb+lighting+getLightState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setLightState(options, [sendOptions])](#Bulb+lighting+setLightState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.schedule](#Bulb+schedule)
        * [.getNextAction([sendOptions])](#Bulb+schedule+getNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getRules([sendOptions])](#Bulb+schedule+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getRule(id, [sendOptions])](#Bulb+schedule+getRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.addRule(options, [sendOptions])](#Bulb+schedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.editRule([sendOptions])](#Bulb+schedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteAllRules([sendOptions])](#Bulb+schedule+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteRule(id, [sendOptions])](#Bulb+schedule+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setOverallEnable(enable, [sendOptions])](#Bulb+schedule+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getDayStats(year, month, [sendOptions])](#Bulb+schedule+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getMonthStats(year, [sendOptions])](#Bulb+schedule+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.eraseStats([sendOptions])](#Bulb+schedule+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.time](#Bulb+time)
        * [.getTime([sendOptions])](#Bulb+time+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getTimezone([sendOptions])](#Bulb+time+getTimezone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.sysInfo](#Bulb+sysInfo) ⇒ <code>Object</code>
    * [.supportsBrightness](#Bulb+supportsBrightness) ⇒ <code>boolean</code>
    * [.supportsColor](#Bulb+supportsColor) ⇒ <code>boolean</code>
    * [.supportsColorTemperature](#Bulb+supportsColorTemperature) ⇒ <code>boolean</code>
    * [.getColorTemperatureRange](#Bulb+getColorTemperatureRange) ⇒ <code>Object</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.id](#Device+id) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.description](#Device+description) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.macNormalized](#Device+macNormalized) ⇒ <code>string</code>
    * [.getInfo([sendOptions])](#Bulb+getInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getPowerState([sendOptions])](#Bulb+getPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setPowerState(value, [sendOptions])](#Bulb+setPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.togglePowerState([sendOptions])](#Bulb+togglePowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.closeConnection()](#Device+closeConnection)
    * [.send(payload, [sendOptions])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [childIds], [sendOptions])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([sendOptions])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias, [sendOptions])](#Device+setAlias) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setLocation(latitude, longitude, [sendOptions])](#Device+setLocation) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel([sendOptions])](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.reboot(delay, [sendOptions])](#Device+reboot) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.reset(delay, [sendOptions])](#Device+reset) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * ["emeter-realtime-update"](#Bulb+event_emeter-realtime-update)
    * ["lightstate-on"](#Bulb+event_lightstate-on)
    * ["lightstate-off"](#Bulb+event_lightstate-off)
    * ["lightstate-change"](#Bulb+event_lightstate-change)
    * ["lightstate-update"](#Bulb+event_lightstate-update)
    * ["polling-error"](#Device+event_polling-error)



* [Plug](#Plug) ⇐ [<code>Device</code>](#Device)
    * [new Plug(options)](#new_Plug_new)
    * [.away](#Plug+away)
        * [.getRules([sendOptions])](#Plug+away+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.addRule(options, [sendOptions])](#Plug+away+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.editRule(options, [sendOptions])](#Plug+away+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteAllRules([sendOptions])](#Plug+away+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteRule(id, [sendOptions])](#Plug+away+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setOverallEnable(enable, [sendOptions])](#Plug+away+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.cloud](#Plug+cloud)
        * [.getInfo([sendOptions])](#Plug+cloud+getInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.bind(username, password, [sendOptions])](#Plug+cloud+bind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.unbind([sendOptions])](#Plug+cloud+unbind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getFirmwareList([sendOptions])](#Plug+cloud+getFirmwareList) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setServerUrl(server, [sendOptions])](#Plug+cloud+setServerUrl) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.dimmer](#Plug+dimmer)
        * [.setBrightness(brightness, [sendOptions])](#Plug+dimmer+setBrightness) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getDefaultBehavior([sendOptions])](#Plug+dimmer+getDefaultBehavior) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
        * [.getDimmerParameters([sendOptions])](#Plug+dimmer+getDimmerParameters) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
        * [.setDimmerTransition(options, [sendOptions])](#Plug+dimmer+setDimmerTransition) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setDoubleClickAction(options, [sendOptions])](#Plug+dimmer+setDoubleClickAction) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
        * [.setFadeOffTime(duration, [sendOptions])](#Plug+dimmer+setFadeOffTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setFadeOnTime(fadeTime, [sendOptions])](#Plug+dimmer+setFadeOnTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setGentleOffTime(fadeTime, [sendOptions])](#Plug+dimmer+setGentleOffTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setGentleOnTime(fadeTime, [sendOptions])](#Plug+dimmer+setGentleOnTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setLongPressAction(options, [sendOptions])](#Plug+dimmer+setLongPressAction) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
        * [.setSwitchState(state, [sendOptions])](#Plug+dimmer+setSwitchState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.emeter](#Plug+emeter)
        * [.realtime](#Plug+emeter+realtime) ⇒ <code>Object</code>
        * [.getRealtime([sendOptions])](#Plug+emeter+getRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getDayStats(year, month, [sendOptions])](#Plug+emeter+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getMonthStats(year, [sendOptions])](#Plug+emeter+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.eraseStats([sendOptions])](#Plug+emeter+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.schedule](#Plug+schedule)
        * [.getNextAction([sendOptions])](#Plug+schedule+getNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getRules([sendOptions])](#Plug+schedule+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getRule(id, [sendOptions])](#Plug+schedule+getRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.addRule(options, [sendOptions])](#Plug+schedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.editRule(options, [sendOptions])](#Plug+schedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteAllRules([sendOptions])](#Plug+schedule+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteRule(id, [sendOptions])](#Plug+schedule+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.setOverallEnable(enable, [sendOptions])](#Plug+schedule+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getDayStats(year, month, [sendOptions])](#Plug+schedule+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getMonthStats(year, [sendOptions])](#Plug+schedule+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.eraseStats([sendOptions])](#Plug+schedule+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.time](#Plug+time)
        * [.getTime([sendOptions])](#Plug+time+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.getTimezone([sendOptions])](#Plug+time+getTimezone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.timer](#Plug+timer)
        * [.getRules([childIds], [sendOptions])](#Plug+timer+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.addRule(options, [sendOptions])](#Plug+timer+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.editRule(options, [sendOptions])](#Plug+timer+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteAllRules([sendOptions])](#Plug+timer+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.sysInfo](#Plug+sysInfo) ⇒ <code>Object</code>
    * [.children](#Plug+children) ⇒ <code>Map</code>
    * [.childId](#Plug+childId) ⇒ <code>string</code>
    * [.alias](#Plug+alias) ⇒ <code>string</code>
    * [.id](#Plug+id) ⇒ <code>string</code>
    * [.inUse](#Plug+inUse) ⇒ <code>boolean</code>
    * [.relayState](#Plug+relayState) ⇒ <code>boolean</code>
    * [.supportsDimmer](#Plug+supportsDimmer) ⇒ <code>boolean</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.description](#Device+description) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.macNormalized](#Device+macNormalized) ⇒ <code>string</code>
    * [.getInfo([sendOptions])](#Plug+getInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getInUse([sendOptions])](#Plug+getInUse) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getLedState([sendOptions])](#Plug+getLedState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setLedState(value, [sendOptions])](#Plug+setLedState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getPowerState([sendOptions])](#Plug+getPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setPowerState(value, [sendOptions])](#Plug+setPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.togglePowerState([sendOptions])](#Plug+togglePowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.blink([times], [rate], [sendOptions])](#Plug+blink) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.closeConnection()](#Device+closeConnection)
    * [.send(payload, [sendOptions])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [childIds], [sendOptions])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([sendOptions])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias, [sendOptions])](#Device+setAlias) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setLocation(latitude, longitude, [sendOptions])](#Device+setLocation) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel([sendOptions])](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.reboot(delay, [sendOptions])](#Device+reboot) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.reset(delay, [sendOptions])](#Device+reset) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * ["power-on"](#Plug+event_power-on)
    * ["power-off"](#Plug+event_power-off)
    * ["power-update"](#Plug+event_power-update)
    * ["in-use"](#Plug+event_in-use)
    * ["not-in-use"](#Plug+event_not-in-use)
    * ["in-use-update"](#Plug+event_in-use-update)
    * ["emeter-realtime-update"](#Plug+event_emeter-realtime-update)
    * ["polling-error"](#Device+event_polling-error)



<a name="Client"></a>

## Client ⇐ <code>EventEmitter</code>
Client that sends commands to specified devices or discover devices on the local subnet.
- Contains factory methods to create devices.
- Events are emitted after [#startDiscovery](#startDiscovery) is called.

**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
<a name="new_Client_new"></a>

### new Client(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.defaultSendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |
| [options.defaultSendOptions.timeout] | <code>number</code> | <code>10000</code> |  |
| [options.defaultSendOptions.transport] | <code>string</code> | <code>&quot;&#x27;tcp&#x27;&quot;</code> |  |
| [options.defaultSendOptions.useSharedSocket] | <code>boolean</code> | <code>false</code> |  |
| [options.defaultSendOptions.sharedSocketTimeout] | <code>number</code> | <code>20000</code> |  |
| [options.logLevel] | <code>string</code> |  | level for built in logger ['error','warn','info','debug','trace'] |

<a name="Client+send"></a>

### client.send(payload, host, [port], [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
[Encrypts](https://github.com/plasticrake/tplink-smarthome-crypto) `payload` and sends to device.
- If `payload` is not a string, it is `JSON.stringify`'d.
- Promise fulfills with parsed JSON response.

Devices use JSON to communicate.\
For Example:
- If a device receives:
  - `{"system":{"get_sysinfo":{}}}`
- It responds with:
  - `{"system":{"get_sysinfo":{
      err_code: 0,
      sw_ver: "1.0.8 Build 151113 Rel.24658",
      hw_ver: "1.0",
      ...
    }}}`

All responses from device contain an `err_code` (`0` is success).

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default |
| --- | --- | --- |
| payload | <code>Object</code> \| <code>string</code> |  | 
| host | <code>string</code> |  | 
| [port] | <code>number</code> | <code>9999</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  | 

<a name="Client+getSysInfo"></a>

### client.getSysInfo(host, [port], [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests `{system:{get_sysinfo:{}}}` from device.

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type | Default |
| --- | --- | --- |
| host | <code>string</code> |  | 
| [port] | <code>number</code> | <code>9999</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  | 

<a name="Client+getBulb"></a>

### client.getBulb(deviceOptions) ⇒ [<code>Bulb</code>](#Bulb)
Creates Bulb object.

See [Device constructor](#Device) and [Bulb constructor](#Bulb) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Bulb constructor](#Bulb) |

<a name="Client+getPlug"></a>

### client.getPlug(deviceOptions) ⇒ [<code>Plug</code>](#Plug)
Creates [Plug](#Plug) object.

See [Device constructor](#Device) and [Plug constructor](#Plug) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Plug constructor](#Plug) |

<a name="Client+getDevice"></a>

### client.getDevice(deviceOptions, [sendOptions]) ⇒ <code>Promise.&lt;(Plug\|Bulb), Error&gt;</code>
Creates a [Plug](#Plug) or [Bulb](#Bulb) after querying device to determine type.

See [Device constructor](#Device), [Bulb constructor](#Bulb), [Plug constructor](#Plug) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Device constructor](#Device) |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Client+getCommonDevice"></a>

### client.getCommonDevice(deviceOptions) ⇒ [<code>Device</code>](#Device)
Create [Device](#Device) object.
- Device object only supports common Device methods.
- See [Device constructor](#Device) for valid options.
- Instead use [#getDevice](#getDevice) to create a fully featured object.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Device constructor](#Device) |

<a name="Client+getDeviceFromSysInfo"></a>

### client.getDeviceFromSysInfo(sysInfo, deviceOptions) ⇒ [<code>Plug</code>](#Plug) \| [<code>Bulb</code>](#Bulb)
Creates device corresponding to the provided `sysInfo`.

See [Device constructor](#Device), [Bulb constructor](#Bulb), [Plug constructor](#Plug) for valid options

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| sysInfo | <code>Object</code> |  |
| deviceOptions | <code>Object</code> | passed to device constructor |

<a name="Client+getTypeFromSysInfo"></a>

### client.getTypeFromSysInfo(sysInfo) ⇒ <code>string</code>
Guess the device type from provided `sysInfo`.

Based on sys_info.[type|mic_type]

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>string</code> - 'plug','bulb','device'  

| Param | Type |
| --- | --- |
| sysInfo | <code>Object</code> | 

<a name="Client+startDiscovery"></a>

### client.startDiscovery(options) ⇒ [<code>Client</code>](#Client)
Discover TP-Link Smarthome devices on the network.

- Sends a discovery packet (via UDP) to the `broadcast` address every `discoveryInterval`(ms).
- Stops discovery after `discoveryTimeout`(ms) (if `0`, runs until [#stopDiscovery](#stopDiscovery) is called).
  - If a device does not respond after `offlineTolerance` number of attempts, [event:Client#device-offline](event:Client#device-offline) is emitted.
- If `deviceTypes` are specified only matching devices are found.
- If `macAddresses` are specified only devices with matching MAC addresses are found.
- If `excludeMacAddresses` are specified devices with matching MAC addresses are excluded.
- if `filterCallback` is specified only devices where the callback returns a truthy value are found.
- If `devices` are specified it will attempt to contact them directly in addition to sending to the broadcast address.
  - `devices` are specified as an array of `[{host, [port: 9999]}]`.

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: [<code>Client</code>](#Client) - this  
**Emits**: [<code>error</code>](#Client+event_error), [<code>device-new</code>](#Client+event_device-new), [<code>device-online</code>](#Client+event_device-online), [<code>device-offline</code>](#Client+event_device-offline), [<code>bulb-new</code>](#Client+event_bulb-new), [<code>bulb-online</code>](#Client+event_bulb-online), [<code>bulb-offline</code>](#Client+event_bulb-offline), [<code>plug-new</code>](#Client+event_plug-new), [<code>plug-online</code>](#Client+event_plug-online), [<code>plug-offline</code>](#Client+event_plug-offline), [<code>discovery-invalid</code>](#Client+event_discovery-invalid)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.address] | <code>string</code> |  | address to bind udp socket |
| [options.port] | <code>number</code> |  | port to bind udp socket |
| [options.broadcast] | <code>string</code> | <code>&quot;255.255.255.255&quot;</code> | broadcast address |
| [options.discoveryInterval] | <code>number</code> | <code>10000</code> | (ms) |
| [options.discoveryTimeout] | <code>number</code> | <code>0</code> | (ms) |
| [options.offlineTolerance] | <code>number</code> | <code>3</code> | # of consecutive missed replies to consider offline |
| [options.deviceTypes] | <code>Array.&lt;string&gt;</code> |  | 'plug','bulb' |
| [options.macAddresses] | <code>Array.&lt;string&gt;</code> |  | MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive, glob style *, and ? in pattern are supported |
| [options.excludeMacAddresses] | <code>Array.&lt;string&gt;</code> |  | MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive, glob style *, and ? in pattern are supported |
| [options.filterCallback] | <code>function</code> |  | called with fn(sysInfo), return truthy value to include device |
| [options.breakoutChildren] | <code>boolean</code> | <code>true</code> | if device has multiple outlets, create a separate plug for each outlet, otherwise create a plug for the main device |
| [options.deviceOptions] | <code>Object</code> | <code>{}</code> | passed to device constructors |
| [options.devices] | <code>Array.&lt;Object&gt;</code> |  | known devices to query instead of relying on broadcast |

<a name="Client+stopDiscovery"></a>

### client.stopDiscovery()
Stops discovery and closes UDP socket.

**Kind**: instance method of [<code>Client</code>](#Client)  
<a name="Client+event_device-new"></a>

### "device-new"
First response from device.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) | 

<a name="Client+event_device-online"></a>

### "device-online"
Follow up response from device.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) | 

<a name="Client+event_device-offline"></a>

### "device-offline"
No response from device.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) | 

<a name="Client+event_bulb-new"></a>

### "bulb-new"
First response from Bulb.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Bulb</code>](#Bulb) | 

<a name="Client+event_bulb-online"></a>

### "bulb-online"
Follow up response from Bulb.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Bulb</code>](#Bulb) | 

<a name="Client+event_bulb-offline"></a>

### "bulb-offline"
No response from Bulb.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Bulb</code>](#Bulb) | 

<a name="Client+event_plug-new"></a>

### "plug-new"
First response from Plug.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Plug</code>](#Plug) | 

<a name="Client+event_plug-online"></a>

### "plug-online"
Follow up response from Plug.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Plug</code>](#Plug) | 

<a name="Client+event_plug-offline"></a>

### "plug-offline"
No response from Plug.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| [<code>Plug</code>](#Plug) | 

<a name="Client+event_discovery-invalid"></a>

### "discovery-invalid"
Invalid/Unknown response from device.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Name | Type |
| --- | --- |
| rinfo | <code>Object</code> | 
| response | <code>Buffer</code> | 
| decryptedResponse | <code>Buffer</code> | 

<a name="Client+event_error"></a>

### "error"
Error during discovery.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| <code>Error</code> | 


<a name="Bulb"></a>

## Bulb ⇐ [<code>Device</code>](#Device)
Bulb Device.

TP-Link models: LB100, LB110, LB120, LB130.

**Kind**: global class  
**Extends**: [<code>Device</code>](#Device), <code>EventEmitter</code>  
**Emits**: [<code>lightstate-on</code>](#Bulb+event_lightstate-on), [<code>lightstate-off</code>](#Bulb+event_lightstate-off), [<code>lightstate-change</code>](#Bulb+event_lightstate-change), [<code>lightstate-update</code>](#Bulb+event_lightstate-update), [<code>emeter-realtime-update</code>](#Bulb+event_emeter-realtime-update)  
**See**: Device  
<a name="new_Bulb_new"></a>

### new Bulb(options)
Created by [Client](#Client) - Do not instantiate directly.

See [Device constructor](#Device) for common options.


| Param | Type |
| --- | --- |
| options | <code>Object</code> | 

<a name="Bulb+cloud"></a>

### bulb.cloud
**Kind**: instance property of [<code>Bulb</code>](#Bulb)  

* [.cloud](#Bulb+cloud)
    * [.getInfo([sendOptions])](#Bulb+cloud+getInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.bind(username, password, [sendOptions])](#Bulb+cloud+bind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.unbind([sendOptions])](#Bulb+cloud+unbind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getFirmwareList([sendOptions])](#Bulb+cloud+getFirmwareList) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setServerUrl(server, [sendOptions])](#Bulb+cloud+setServerUrl) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Bulb+cloud+getInfo"></a>

#### cloud.getInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's TP-Link cloud info.

Requests `cloud.get_info`. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+bind"></a>

#### cloud.bind(username, password, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add device to TP-Link cloud.

Sends `cloud.bind` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| username | <code>string</code> | 
| password | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+unbind"></a>

#### cloud.unbind([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Remove device from TP-Link cloud.

Sends `cloud.unbind` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+getFirmwareList"></a>

#### cloud.getFirmwareList([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get device's TP-Link cloud firmware list.

Sends `cloud.get_intl_fw_list` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+setServerUrl"></a>

#### cloud.setServerUrl(server, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets device's TP-Link cloud server URL.

Sends `cloud.set_server_url` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | URL |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Bulb+emeter"></a>

### bulb.emeter
**Kind**: instance property of [<code>Bulb</code>](#Bulb)  

* [.emeter](#Bulb+emeter)
    * [.realtime](#Bulb+emeter+realtime) ⇒ <code>Object</code>
    * [.getRealtime([sendOptions])](#Bulb+emeter+getRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDayStats(year, month, [sendOptions])](#Bulb+emeter+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getMonthStats(year, [sendOptions])](#Bulb+emeter+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.eraseStats([sendOptions])](#Bulb+emeter+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Bulb+emeter+realtime"></a>

#### emeter.realtime ⇒ <code>Object</code>
Returns cached results from last retrieval of `emeter.get_realtime`.

**Kind**: instance property of [<code>emeter</code>](#Bulb+emeter)  
<a name="Bulb+emeter+getRealtime"></a>

#### emeter.getRealtime([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's current energy stats.

Requests `emeter.get_realtime`. Older devices return `current`, `voltage`, etc,
while newer devices return `current_ma`, `voltage_mv` etc
This will return a normalized response including both old and new style properties for backwards compatibility.
Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+emeter+getDayStats"></a>

#### emeter.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Emeter Statistics.

Sends `emeter.get_daystat` command. Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+emeter+getMonthStats"></a>

#### emeter.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Emeter Statistics.

Sends `emeter.get_monthstat` command. Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+emeter+eraseStats"></a>

#### emeter.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Emeter Statistics.

Sends `emeter.erase_runtime_stat` command. Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+lighting"></a>

### bulb.lighting
**Kind**: instance property of [<code>Bulb</code>](#Bulb)  

* [.lighting](#Bulb+lighting)
    * [.lightState](#Bulb+lighting+lightState) ⇒ <code>Object</code>
    * [.getLightState([sendOptions])](#Bulb+lighting+getLightState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setLightState(options, [sendOptions])](#Bulb+lighting+setLightState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>

<a name="Bulb+lighting+lightState"></a>

#### lighting.lightState ⇒ <code>Object</code>
Returns cached results from last retrieval of `lightingservice.get_light_state`.

**Kind**: instance property of [<code>lighting</code>](#Bulb+lighting)  
<a name="Bulb+lighting+getLightState"></a>

#### lighting.getLightState([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Bulb light state.

Requests `lightingservice.get_light_state`.

**Kind**: instance method of [<code>lighting</code>](#Bulb+lighting)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+lighting+setLightState"></a>

#### lighting.setLightState(options, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Sets Bulb light state (on/off, brightness, color, etc).

Sends `lightingservice.transition_light_state` command.

**Kind**: instance method of [<code>lighting</code>](#Bulb+lighting)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.transition_period] | <code>number</code> |  | (ms) |
| [options.on_off] | <code>boolean</code> |  |  |
| [options.mode] | <code>string</code> |  |  |
| [options.hue] | <code>number</code> |  | 0-360 |
| [options.saturation] | <code>number</code> |  | 0-100 |
| [options.brightness] | <code>number</code> |  | 0-100 |
| [options.color_temp] | <code>number</code> |  | Kelvin (LB120:2700-6500 LB130:2500-9000) |
| [options.ignore_default] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Bulb+schedule"></a>

### bulb.schedule
**Kind**: instance property of [<code>Bulb</code>](#Bulb)  

* [.schedule](#Bulb+schedule)
    * [.getNextAction([sendOptions])](#Bulb+schedule+getNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRules([sendOptions])](#Bulb+schedule+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRule(id, [sendOptions])](#Bulb+schedule+getRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Bulb+schedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule([sendOptions])](#Bulb+schedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Bulb+schedule+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteRule(id, [sendOptions])](#Bulb+schedule+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setOverallEnable(enable, [sendOptions])](#Bulb+schedule+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDayStats(year, month, [sendOptions])](#Bulb+schedule+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getMonthStats(year, [sendOptions])](#Bulb+schedule+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.eraseStats([sendOptions])](#Bulb+schedule+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Bulb+schedule+getNextAction"></a>

#### schedule.getNextAction([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Next Schedule Rule Action.

Requests `schedule.get_next_action`. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getRules"></a>

#### schedule.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getRule"></a>

#### schedule.getRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rule.

Requests `schedule.get_rules` and return rule matching Id. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response of rule  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+addRule"></a>

#### schedule.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Schedule rule.

Sends `schedule.add_rule` command and returns rule id.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.lightState | <code>Object</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  |  |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Bulb+schedule+editRule"></a>

#### schedule.editRule([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Schedule rule.

Sends `schedule.edit_rule` command and returns rule id.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options.id | <code>string</code> |  |  |
| options.lightState | <code>Object</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  | [description] |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Bulb+schedule+deleteAllRules"></a>

#### schedule.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes All Schedule Rules.

Sends `schedule.delete_all_rules` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+deleteRule"></a>

#### schedule.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Schedule Rule.

Sends `schedule.delete_rule` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+setOverallEnable"></a>

#### schedule.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Schedule Rules.

Sends `schedule.set_overall_enable` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getDayStats"></a>

#### schedule.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Usage Statistics.

Sends `schedule.get_daystat` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getMonthStats"></a>

#### schedule.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Usage Statistics.

Sends `schedule.get_monthstat` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+eraseStats"></a>

#### schedule.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Usage Statistics.

Sends `schedule.erase_runtime_stat` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+time"></a>

### bulb.time
**Kind**: instance property of [<code>Bulb</code>](#Bulb)  

* [.time](#Bulb+time)
    * [.getTime([sendOptions])](#Bulb+time+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimezone([sendOptions])](#Bulb+time+getTimezone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Bulb+time+getTime"></a>

#### time.getTime([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's time.

Requests `timesetting.get_time`. Does not support ChildId.

**Kind**: instance method of [<code>time</code>](#Bulb+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+time+getTimezone"></a>

#### time.getTimezone([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`. Does not support ChildId.

**Kind**: instance method of [<code>time</code>](#Bulb+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+sysInfo"></a>

### bulb.sysInfo ⇒ <code>Object</code>
Returns cached results from last retrieval of `system.sys_info`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>sysInfo</code>](#Device+sysInfo)  
**Returns**: <code>Object</code> - system.sys_info  
<a name="Bulb+supportsBrightness"></a>

### bulb.supportsBrightness ⇒ <code>boolean</code>
Cached value of `sys_info.is_dimmable === 1`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+supportsColor"></a>

### bulb.supportsColor ⇒ <code>boolean</code>
Cached value of `sys_info.is_color === 1`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+supportsColorTemperature"></a>

### bulb.supportsColorTemperature ⇒ <code>boolean</code>
Cached value of `sys_info.is_variable_color_temp === 1`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+getColorTemperatureRange"></a>

### bulb.getColorTemperatureRange ⇒ <code>Object</code>
Returns array with min and max supported color temperatures

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Object</code> - range  
<a name="Device+alias"></a>

### bulb.alias ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>alias</code>](#Device+alias)  
<a name="Device+id"></a>

### bulb.id ⇒ <code>string</code>
Cached value of `sys_info.deviceId`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>id</code>](#Device+id)  
<a name="Device+deviceId"></a>

### bulb.deviceId ⇒ <code>string</code>
Cached value of `sys_info.deviceId`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>deviceId</code>](#Device+deviceId)  
<a name="Device+description"></a>

### bulb.description ⇒ <code>string</code>
Cached value of `sys_info.[description|dev_name]`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>description</code>](#Device+description)  
<a name="Device+model"></a>

### bulb.model ⇒ <code>string</code>
Cached value of `sys_info.model`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>model</code>](#Device+model)  
<a name="Device+name"></a>

### bulb.name ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>name</code>](#Device+name)  
<a name="Device+type"></a>

### bulb.type ⇒ <code>string</code>
Cached value of `sys_info.[type|mic_type]`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>type</code>](#Device+type)  
<a name="Device+deviceType"></a>

### bulb.deviceType ⇒ <code>string</code>
Type of device (or `device` if unknown).

Based on cached value of `sys_info.[type|mic_type]`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>deviceType</code>](#Device+deviceType)  
**Returns**: <code>string</code> - 'plug'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### bulb.softwareVersion ⇒ <code>string</code>
Cached value of `sys_info.sw_ver`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>softwareVersion</code>](#Device+softwareVersion)  
<a name="Device+hardwareVersion"></a>

### bulb.hardwareVersion ⇒ <code>string</code>
Cached value of `sys_info.hw_ver`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>hardwareVersion</code>](#Device+hardwareVersion)  
<a name="Device+mac"></a>

### bulb.mac ⇒ <code>string</code>
Cached value of `sys_info.[mac|mic_mac|ethernet_mac]`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>mac</code>](#Device+mac)  
<a name="Device+macNormalized"></a>

### bulb.macNormalized ⇒ <code>string</code>
Normalized cached value of `sys_info.[mac|mic_mac|ethernet_mac]`

Removes all non alphanumeric characters and makes uppercase
`aa:bb:cc:00:11:22` will be normalized to `AABBCC001122`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>macNormalized</code>](#Device+macNormalized)  
<a name="Bulb+getInfo"></a>

### bulb.getInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests common Bulb status details in a single request.
- `system.get_sysinfo`
- `cloud.get_sysinfo`
- `emeter.get_realtime`
- `schedule.get_next_action`

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+getPowerState"></a>

### bulb.getPowerState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Gets on/off state of Bulb.

Requests `lightingservice.get_light_state` and returns true if `on_off === 1`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+setPowerState"></a>

### bulb.setPowerState(value, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Sets on/off state of Bulb.

Sends `lightingservice.transition_light_state` command with on_off `value`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | true: on, false: off |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Bulb+togglePowerState"></a>

### bulb.togglePowerState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Toggles state of Bulb.

Requests `lightingservice.get_light_state` sets the power state to the opposite of `on_off === 1` and returns the new power state.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+closeConnection"></a>

### bulb.closeConnection()
Closes any open network connections including any shared sockets.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>closeConnection</code>](#Device+closeConnection)  
<a name="Device+send"></a>

### bulb.send(payload, [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>send</code>](#Device+send)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+sendCommand"></a>

### bulb.sendCommand(command, [childIds], [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- Adds context.child_ids:[] to the command.
  - If `childIds` parameter is set. _or_
  - If device was instantiated with a childId it will default to that value.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for command.\
    Example: `{system:{get_sysinfo:{}}}`
    - resolves to: `{err_code:0,...}`\
    - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as [#send](#send) would)
- If more than one operation was sent:
  - Promise fulfills with full parsed JSON response (same as [#send](#send))

Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with [ResponseError](#ResponseError).

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>sendCommand</code>](#Device+sendCommand)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| command | <code>Object</code> \| <code>string</code> | 
| [childIds] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+startPolling"></a>

### bulb.startPolling(interval) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
Polls the device every `interval`.

Returns `this` (for chaining) that emits events based on state changes.
Refer to specific device sections for event details.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>startPolling</code>](#Device+startPolling)  
**Returns**: [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) - this  
**Emits**: [<code>polling-error</code>](#Device+event_polling-error)  

| Param | Type | Description |
| --- | --- | --- |
| interval | <code>number</code> | (ms) |

<a name="Device+stopPolling"></a>

### bulb.stopPolling()
Stops device polling.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>stopPolling</code>](#Device+stopPolling)  
<a name="Device+getSysInfo"></a>

### bulb.getSysInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device. Does not support childId.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>getSysInfo</code>](#Device+getSysInfo)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setAlias"></a>

### bulb.setAlias(alias, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command. Supports childId.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>setAlias</code>](#Device+setAlias)  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setLocation"></a>

### bulb.setLocation(latitude, longitude, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set device's location.

Sends `system.set_dev_location` command. Does not support childId.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>setLocation</code>](#Device+setLocation)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| latitude | <code>number</code> | 
| longitude | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+getModel"></a>

### bulb.getModel([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name. Does not support childId.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>getModel</code>](#Device+getModel)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reboot"></a>

### bulb.reboot(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reboot device.

Sends `system.reboot` command. Does not support childId.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>reboot</code>](#Device+reboot)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reset"></a>

### bulb.reset(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reset device.

Sends `system.reset` command. Does not support childId.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>reset</code>](#Device+reset)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+event_emeter-realtime-update"></a>

### "emeter-realtime-update"
Bulb's Energy Monitoring Details were updated from device. Fired regardless if status was changed.

**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | emeterRealtime |

<a name="Bulb+event_lightstate-on"></a>

### "lightstate-on"
Bulb was turned on (`lightstate.on_off`).

**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | lightstate |

<a name="Bulb+event_lightstate-off"></a>

### "lightstate-off"
Bulb was turned off (`lightstate.on_off`).

**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | lightstate |

<a name="Bulb+event_lightstate-change"></a>

### "lightstate-change"
Bulb's lightstate was changed.

**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | lightstate |

<a name="Bulb+event_lightstate-update"></a>

### "lightstate-update"
Bulb's lightstate state was updated from device. Fired regardless if status was changed.

**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | lightstate |

<a name="Device+event_polling-error"></a>

### "polling-error"
**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>polling-error</code>](#Device+event_polling-error)  
**Properties**

| Name | Type |
| --- | --- |
| error | <code>Error</code> | 


<a name="Plug"></a>

## Plug ⇐ [<code>Device</code>](#Device)
Plug Device.

TP-Link models: HS100, HS105, HS107, HS110, HS200, HS210, HS220, HS300.

Models with multiple outlets (HS107, HS300) will have a children property.
If Plug is instantiated with a childId it will control the outlet associated with that childId.
Some functions only apply to the entire device, and are noted below.

Emits events after device status is queried, such as [#getSysInfo](#getSysInfo) and [#getEmeterRealtime](#getEmeterRealtime).

**Kind**: global class  
**Extends**: [<code>Device</code>](#Device), <code>EventEmitter</code>  
**Emits**: [<code>power-on</code>](#Plug+event_power-on), [<code>power-off</code>](#Plug+event_power-off), [<code>power-update</code>](#Plug+event_power-update), [<code>in-use</code>](#Plug+event_in-use), [<code>not-in-use</code>](#Plug+event_not-in-use), [<code>in-use-update</code>](#Plug+event_in-use-update), [<code>emeter-realtime-update</code>](#Plug+event_emeter-realtime-update)  
<a name="new_Plug_new"></a>

### new Plug(options)
Created by [Client](#Client) - Do not instantiate directly.

See [Device constructor](#Device) for common options.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.inUseThreshold] | <code>number</code> | <code>0.1</code> | Watts |
| [options.childId] | <code>string</code> |  | If passed an integer or string between 0 and 99 it will prepend the deviceId |

<a name="Plug+away"></a>

### plug.away
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.away](#Plug+away)
    * [.getRules([sendOptions])](#Plug+away+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Plug+away+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#Plug+away+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Plug+away+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteRule(id, [sendOptions])](#Plug+away+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setOverallEnable(enable, [sendOptions])](#Plug+away+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+away+getRules"></a>

#### away.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Away Rules.

Requests `anti_theft.get_rules`. Support childId.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+away+addRule"></a>

#### away.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Away Rule.

Sends `anti_theft.add_rule` command and returns rule id. Support childId.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| options.end | <code>Date</code> \| <code>number</code> |  | Date or number of minutes (only time component of date is used) |
| options.daysOfWeek | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.frequency] | <code>number</code> | <code>5</code> |  |
| [options.name] | <code>string</code> |  |  |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+away+editRule"></a>

#### away.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Away rule.

Sends `anti_theft.edit_rule` command and returns rule id. Support childId.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.id | <code>string</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| options.end | <code>Date</code> \| <code>number</code> |  | Date or number of minutes (only time component of date is used) |
| options.daysOfWeek | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.frequency] | <code>number</code> | <code>5</code> |  |
| [options.name] | <code>string</code> |  |  |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+away+deleteAllRules"></a>

#### away.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes All Away Rules.

Sends `anti_theft.delete_all_rules` command. Support childId.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+away+deleteRule"></a>

#### away.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Away Rule.

Sends `anti_theft.delete_rule` command. Support childId.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+away+setOverallEnable"></a>

#### away.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Away Rules.

Sends `anti_theft.set_overall_enable` command. Support childId.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud"></a>

### plug.cloud
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.cloud](#Plug+cloud)
    * [.getInfo([sendOptions])](#Plug+cloud+getInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.bind(username, password, [sendOptions])](#Plug+cloud+bind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.unbind([sendOptions])](#Plug+cloud+unbind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getFirmwareList([sendOptions])](#Plug+cloud+getFirmwareList) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setServerUrl(server, [sendOptions])](#Plug+cloud+setServerUrl) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+cloud+getInfo"></a>

#### cloud.getInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's TP-Link cloud info.

Requests `cloud.get_info`. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+bind"></a>

#### cloud.bind(username, password, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add device to TP-Link cloud.

Sends `cloud.bind` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| username | <code>string</code> | 
| password | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+unbind"></a>

#### cloud.unbind([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Remove device from TP-Link cloud.

Sends `cloud.unbind` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+getFirmwareList"></a>

#### cloud.getFirmwareList([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get device's TP-Link cloud firmware list.

Sends `cloud.get_intl_fw_list` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+setServerUrl"></a>

#### cloud.setServerUrl(server, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets device's TP-Link cloud server URL.

Sends `cloud.set_server_url` command. Does not support childId.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | URL |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer"></a>

### plug.dimmer
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.dimmer](#Plug+dimmer)
    * [.setBrightness(brightness, [sendOptions])](#Plug+dimmer+setBrightness) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDefaultBehavior([sendOptions])](#Plug+dimmer+getDefaultBehavior) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getDimmerParameters([sendOptions])](#Plug+dimmer+getDimmerParameters) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setDimmerTransition(options, [sendOptions])](#Plug+dimmer+setDimmerTransition) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setDoubleClickAction(options, [sendOptions])](#Plug+dimmer+setDoubleClickAction) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setFadeOffTime(duration, [sendOptions])](#Plug+dimmer+setFadeOffTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setFadeOnTime(fadeTime, [sendOptions])](#Plug+dimmer+setFadeOnTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setGentleOffTime(fadeTime, [sendOptions])](#Plug+dimmer+setGentleOffTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setGentleOnTime(fadeTime, [sendOptions])](#Plug+dimmer+setGentleOnTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setLongPressAction(options, [sendOptions])](#Plug+dimmer+setLongPressAction) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setSwitchState(state, [sendOptions])](#Plug+dimmer+setSwitchState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+dimmer+setBrightness"></a>

#### dimmer.setBrightness(brightness, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets Plug to the specified `brightness`.

Sends `dimmer.set_brightness` command. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| brightness | <code>Boolean</code> | 0-100 |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer+getDefaultBehavior"></a>

#### dimmer.getDefaultBehavior([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug/Dimmer default behavior configuration.

Requests `dimmer.get_default_behavior`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+dimmer+getDimmerParameters"></a>

#### dimmer.getDimmerParameters([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug/Dimmer parameters configuration.

Requests `dimmer.get_dimmer_parameters`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+dimmer+setDimmerTransition"></a>

#### dimmer.setDimmerTransition(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Transitions Plug to the specified `brightness`.

Sends `dimmer.set_dimmer_transition` command. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| [options.brightness] | <code>Boolean</code> | 0-100 |
| [options.mode] | <code>number</code> | "gentle_on_off", etc. |
| [options.duration] | <code>number</code> | duration in seconds |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer+setDoubleClickAction"></a>

#### dimmer.setDoubleClickAction(options, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Set Plug/Dimmer `default_behavior` configuration for `double_click`.

Sends `dimmer.set_double_click_action`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  

| Param | Type |
| --- | --- |
| options | <code>Object</code> | 
| [options.mode] | <code>string</code> | 
| [options.index] | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+dimmer+setFadeOffTime"></a>

#### dimmer.setFadeOffTime(duration, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set Plug `dimmer_parameters` for `fadeOffTime`.

Sends `dimmer.set_fade_off_time`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| duration | <code>number</code> | duration in ms |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer+setFadeOnTime"></a>

#### dimmer.setFadeOnTime(fadeTime, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set Plug `dimmer_parameters` for `fadeOnTime`.

Sends `dimmer.set_fade_on_time`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| fadeTime | <code>number</code> | duration in ms |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer+setGentleOffTime"></a>

#### dimmer.setGentleOffTime(fadeTime, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set Plug `dimmer_parameters` for `gentleOffTime`.

Sends `dimmer.set_gentle_off_time`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| fadeTime | <code>number</code> | duration in ms |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer+setGentleOnTime"></a>

#### dimmer.setGentleOnTime(fadeTime, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set Plug `dimmer_parameters` for `gentleOnTime`.

Sends `dimmer.set_gentle_on_time`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| fadeTime | <code>number</code> | duration in ms |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+dimmer+setLongPressAction"></a>

#### dimmer.setLongPressAction(options, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Set Plug/Dimmer `default_behavior` configuration for `long_press`.

Sends `dimmer.set_long_press_action`. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  

| Param | Type |
| --- | --- |
| options | <code>Object</code> | 
| [options.mode] | <code>string</code> | 
| [options.index] | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+dimmer+setSwitchState"></a>

#### dimmer.setSwitchState(state, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets Plug to the specified on/off state.

Sends `dimmer.set_switch_state` command. Does not support childId.

**Kind**: instance method of [<code>dimmer</code>](#Plug+dimmer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>Boolean</code> | true=on, false=off |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+emeter"></a>

### plug.emeter
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.emeter](#Plug+emeter)
    * [.realtime](#Plug+emeter+realtime) ⇒ <code>Object</code>
    * [.getRealtime([sendOptions])](#Plug+emeter+getRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDayStats(year, month, [sendOptions])](#Plug+emeter+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getMonthStats(year, [sendOptions])](#Plug+emeter+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.eraseStats([sendOptions])](#Plug+emeter+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+emeter+realtime"></a>

#### emeter.realtime ⇒ <code>Object</code>
Returns cached results from last retrieval of `emeter.get_realtime`.

**Kind**: instance property of [<code>emeter</code>](#Plug+emeter)  
<a name="Plug+emeter+getRealtime"></a>

#### emeter.getRealtime([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's current energy stats.

Requests `emeter.get_realtime`. Older devices return `current`, `voltage`, etc,
while newer devices return `current_ma`, `voltage_mv` etc
This will return a normalized response including both old and new style properties for backwards compatibility.
Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+emeter+getDayStats"></a>

#### emeter.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Emeter Statistics.

Sends `emeter.get_daystat` command. Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+emeter+getMonthStats"></a>

#### emeter.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Emeter Statistics.

Sends `emeter.get_monthstat` command. Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+emeter+eraseStats"></a>

#### emeter.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Emeter Statistics.

Sends `emeter.erase_runtime_stat` command. Supports childId.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule"></a>

### plug.schedule
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.schedule](#Plug+schedule)
    * [.getNextAction([sendOptions])](#Plug+schedule+getNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRules([sendOptions])](#Plug+schedule+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRule(id, [sendOptions])](#Plug+schedule+getRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Plug+schedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#Plug+schedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Plug+schedule+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteRule(id, [sendOptions])](#Plug+schedule+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setOverallEnable(enable, [sendOptions])](#Plug+schedule+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDayStats(year, month, [sendOptions])](#Plug+schedule+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getMonthStats(year, [sendOptions])](#Plug+schedule+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.eraseStats([sendOptions])](#Plug+schedule+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+schedule+getNextAction"></a>

#### schedule.getNextAction([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Next Schedule Rule Action.

Requests `schedule.get_next_action`. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getRules"></a>

#### schedule.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getRule"></a>

#### schedule.getRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rule.

Requests `schedule.get_rules` and return rule matching Id. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response of rule  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+addRule"></a>

#### schedule.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Schedule rule.

Sends `schedule.add_rule` command and returns rule id. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.powerState] | <code>boolean</code> |  |  |
| [options.dimmer] | <code>Object</code> |  | dimmer data (dimmable plugs only) |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  |  |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+schedule+editRule"></a>

#### schedule.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Schedule rule.

Sends `schedule.edit_rule` command and returns rule id. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.id | <code>string</code> |  |  |
| [options.powerState] | <code>boolean</code> |  |  |
| [options.dimmer] | <code>Object</code> |  | dimmer data (dimmable plugs only) |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  | [description] |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+schedule+deleteAllRules"></a>

#### schedule.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes All Schedule Rules.

Sends `schedule.delete_all_rules` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+deleteRule"></a>

#### schedule.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Schedule Rule.

Sends `schedule.delete_rule` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+setOverallEnable"></a>

#### schedule.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Schedule Rules.

Sends `schedule.set_overall_enable` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getDayStats"></a>

#### schedule.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Usage Statistics.

Sends `schedule.get_daystat` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getMonthStats"></a>

#### schedule.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Usage Statistics.

Sends `schedule.get_monthstat` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+eraseStats"></a>

#### schedule.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Usage Statistics.

Sends `schedule.erase_runtime_stat` command. Supports childId.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+time"></a>

### plug.time
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.time](#Plug+time)
    * [.getTime([sendOptions])](#Plug+time+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimezone([sendOptions])](#Plug+time+getTimezone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+time+getTime"></a>

#### time.getTime([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's time.

Requests `timesetting.get_time`. Does not support ChildId.

**Kind**: instance method of [<code>time</code>](#Plug+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+time+getTimezone"></a>

#### time.getTimezone([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`. Does not support ChildId.

**Kind**: instance method of [<code>time</code>](#Plug+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+timer"></a>

### plug.timer
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.timer](#Plug+timer)
    * [.getRules([childIds], [sendOptions])](#Plug+timer+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Plug+timer+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#Plug+timer+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Plug+timer+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+timer+getRules"></a>

#### timer.getRules([childIds], [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Countdown Timer Rule (only one allowed).

Requests `count_down.get_rules`. Supports childId.

**Kind**: instance method of [<code>timer</code>](#Plug+timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| [childIds] | <code>Array.&lt;string&gt;</code> \| <code>string</code> \| <code>Array.&lt;number&gt;</code> \| <code>number</code> | for multi-outlet devices, which outlet(s) to target |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+timer+addRule"></a>

#### timer.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add Countdown Timer Rule (only one allowed).

Sends count_down.add_rule command. Supports childId.

**Kind**: instance method of [<code>timer</code>](#Plug+timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.delay | <code>number</code> |  | delay in seconds |
| options.powerState | <code>boolean</code> |  | turn on or off device |
| [options.name] | <code>string</code> | <code>&quot;&#x27;timer&#x27;&quot;</code> | rule name |
| [options.enable] | <code>boolean</code> | <code>true</code> | rule enabled |
| [options.deleteExisting] | <code>boolean</code> | <code>true</code> | send `delete_all_rules` command before adding |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+timer+editRule"></a>

#### timer.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edit Countdown Timer Rule (only one allowed).

Sends count_down.edit_rule command. Supports childId.

**Kind**: instance method of [<code>timer</code>](#Plug+timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.id | <code>string</code> |  | rule id |
| options.delay | <code>number</code> |  | delay in seconds |
| options.powerState | <code>number</code> |  | turn on or off device |
| [options.name] | <code>string</code> | <code>&quot;&#x27;timer&#x27;&quot;</code> | rule name |
| [options.enable] | <code>Boolean</code> | <code>true</code> | rule enabled |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+timer+deleteAllRules"></a>

#### timer.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Delete Countdown Timer Rule (only one allowed).

Sends count_down.delete_all_rules command. Supports childId.

**Kind**: instance method of [<code>timer</code>](#Plug+timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+sysInfo"></a>

### plug.sysInfo ⇒ <code>Object</code>
Returns cached results from last retrieval of `system.sys_info`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>sysInfo</code>](#Device+sysInfo)  
**Returns**: <code>Object</code> - system.sys_info  
<a name="Plug+children"></a>

### plug.children ⇒ <code>Map</code>
Returns children as a map keyed by childId. From cached results from last retrieval of `system.sys_info.children`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Returns**: <code>Map</code> - children  
<a name="Plug+childId"></a>

### plug.childId ⇒ <code>string</code>
Returns childId.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Returns**: <code>string</code> - childId  
<a name="Plug+alias"></a>

### plug.alias ⇒ <code>string</code>
Cached value of `sys_info.alias` or `sys_info.children[childId].alias` if childId set.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>alias</code>](#Device+alias)  
<a name="Plug+id"></a>

### plug.id ⇒ <code>string</code>
Cached value of `sys_info.deviceId` or `childId` if set.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>id</code>](#Device+id)  
<a name="Plug+inUse"></a>

### plug.inUse ⇒ <code>boolean</code>
Determines if device is in use based on cached `emeter.get_realtime` results.

If device supports energy monitoring (e.g. HS110): `power > inUseThreshold`. `inUseThreshold` is specified in Watts

Otherwise fallback on relay state: `relay_state === 1` or `sys_info.children[childId].state === 1`.

Supports childId.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Plug+relayState"></a>

### plug.relayState ⇒ <code>boolean</code>
Cached value of `sys_info.relay_state === 1` or `sys_info.children[childId].state === 1`. Supports childId.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Returns**: <code>boolean</code> - On (true) or Off (false)  
<a name="Plug+supportsDimmer"></a>

### plug.supportsDimmer ⇒ <code>boolean</code>
Cached value of `sys_info.brightness != null`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+deviceId"></a>

### plug.deviceId ⇒ <code>string</code>
Cached value of `sys_info.deviceId`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>deviceId</code>](#Device+deviceId)  
<a name="Device+description"></a>

### plug.description ⇒ <code>string</code>
Cached value of `sys_info.[description|dev_name]`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>description</code>](#Device+description)  
<a name="Device+model"></a>

### plug.model ⇒ <code>string</code>
Cached value of `sys_info.model`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>model</code>](#Device+model)  
<a name="Device+name"></a>

### plug.name ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>name</code>](#Device+name)  
<a name="Device+type"></a>

### plug.type ⇒ <code>string</code>
Cached value of `sys_info.[type|mic_type]`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>type</code>](#Device+type)  
<a name="Device+deviceType"></a>

### plug.deviceType ⇒ <code>string</code>
Type of device (or `device` if unknown).

Based on cached value of `sys_info.[type|mic_type]`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>deviceType</code>](#Device+deviceType)  
**Returns**: <code>string</code> - 'plug'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### plug.softwareVersion ⇒ <code>string</code>
Cached value of `sys_info.sw_ver`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>softwareVersion</code>](#Device+softwareVersion)  
<a name="Device+hardwareVersion"></a>

### plug.hardwareVersion ⇒ <code>string</code>
Cached value of `sys_info.hw_ver`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>hardwareVersion</code>](#Device+hardwareVersion)  
<a name="Device+mac"></a>

### plug.mac ⇒ <code>string</code>
Cached value of `sys_info.[mac|mic_mac|ethernet_mac]`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>mac</code>](#Device+mac)  
<a name="Device+macNormalized"></a>

### plug.macNormalized ⇒ <code>string</code>
Normalized cached value of `sys_info.[mac|mic_mac|ethernet_mac]`

Removes all non alphanumeric characters and makes uppercase
`aa:bb:cc:00:11:22` will be normalized to `AABBCC001122`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>macNormalized</code>](#Device+macNormalized)  
<a name="Plug+getInfo"></a>

### plug.getInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests common Plug status details in a single request.
- `system.get_sysinfo`
- `cloud.get_sysinfo`
- `emeter.get_realtime`
- `schedule.get_next_action`

Supports childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+getInUse"></a>

### plug.getInUse([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Same as [#inUse](#inUse), but requests current `emeter.get_realtime`. Supports childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+getLedState"></a>

### plug.getLedState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug LED state (night mode).

Requests `system.sys_info` and returns true if `led_off === 0`. Does not support childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;boolean, ResponseError&gt;</code> - LED State, true === on  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+setLedState"></a>

### plug.setLedState(value, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Turn Plug LED on/off (night mode). Does not support childId.

Sends `system.set_led_off` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | LED State, true === on |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+getPowerState"></a>

### plug.getPowerState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug relay state (on/off).

Requests `system.get_sysinfo` and returns true if On. Calls [#relayState](#relayState). Supports childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+setPowerState"></a>

### plug.setPowerState(value, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Turns Plug relay on/off.

Sends `system.set_relay_state` command. Supports childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| value | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+togglePowerState"></a>

### plug.togglePowerState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Toggles Plug relay state.

Requests `system.get_sysinfo` sets the power state to the opposite `relay_state === 1 and returns the new power state`. Supports childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+blink"></a>

### plug.blink([times], [rate], [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Blink Plug LED.

Sends `system.set_led_off` command alternating on and off number of `times` at `rate`,
then sets the led to its pre-blink state. Does not support childId.

Note: `system.set_led_off` is particularly slow, so blink rate is not guaranteed.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type | Default |
| --- | --- | --- |
| [times] | <code>number</code> | <code>5</code> | 
| [rate] | <code>number</code> | <code>1000</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  | 

<a name="Device+closeConnection"></a>

### plug.closeConnection()
Closes any open network connections including any shared sockets.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>closeConnection</code>](#Device+closeConnection)  
<a name="Device+send"></a>

### plug.send(payload, [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>send</code>](#Device+send)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+sendCommand"></a>

### plug.sendCommand(command, [childIds], [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- Adds context.child_ids:[] to the command.
  - If `childIds` parameter is set. _or_
  - If device was instantiated with a childId it will default to that value.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for command.\
    Example: `{system:{get_sysinfo:{}}}`
    - resolves to: `{err_code:0,...}`\
    - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as [#send](#send) would)
- If more than one operation was sent:
  - Promise fulfills with full parsed JSON response (same as [#send](#send))

Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with [ResponseError](#ResponseError).

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>sendCommand</code>](#Device+sendCommand)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| command | <code>Object</code> \| <code>string</code> | 
| [childIds] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+startPolling"></a>

### plug.startPolling(interval) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
Polls the device every `interval`.

Returns `this` (for chaining) that emits events based on state changes.
Refer to specific device sections for event details.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>startPolling</code>](#Device+startPolling)  
**Returns**: [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) - this  
**Emits**: [<code>polling-error</code>](#Device+event_polling-error)  

| Param | Type | Description |
| --- | --- | --- |
| interval | <code>number</code> | (ms) |

<a name="Device+stopPolling"></a>

### plug.stopPolling()
Stops device polling.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>stopPolling</code>](#Device+stopPolling)  
<a name="Device+getSysInfo"></a>

### plug.getSysInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device. Does not support childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>getSysInfo</code>](#Device+getSysInfo)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setAlias"></a>

### plug.setAlias(alias, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command. Supports childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>setAlias</code>](#Device+setAlias)  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setLocation"></a>

### plug.setLocation(latitude, longitude, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set device's location.

Sends `system.set_dev_location` command. Does not support childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>setLocation</code>](#Device+setLocation)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| latitude | <code>number</code> | 
| longitude | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+getModel"></a>

### plug.getModel([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name. Does not support childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>getModel</code>](#Device+getModel)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reboot"></a>

### plug.reboot(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reboot device.

Sends `system.reboot` command. Does not support childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>reboot</code>](#Device+reboot)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reset"></a>

### plug.reset(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reset device.

Sends `system.reset` command. Does not support childId.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>reset</code>](#Device+reset)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+event_power-on"></a>

### "power-on"
Plug's relay was turned on.

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
<a name="Plug+event_power-off"></a>

### "power-off"
Plug's relay was turned off.

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
<a name="Plug+event_power-update"></a>

### "power-update"
Plug's relay state was updated from device. Fired regardless if status was changed.

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | Relay State |

<a name="Plug+event_in-use"></a>

### "in-use"
Plug's relay was turned on _or_ power draw exceeded `inUseThreshold` for HS110

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
<a name="Plug+event_not-in-use"></a>

### "not-in-use"
Plug's relay was turned off _or_ power draw fell below `inUseThreshold` for HS110

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
<a name="Plug+event_in-use-update"></a>

### "in-use-update"
Plug's in-use state was updated from device. Fired regardless if status was changed.

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | In Use State |

<a name="Plug+event_emeter-realtime-update"></a>

### "emeter-realtime-update"
Plug's Energy Monitoring Details were updated from device. Fired regardless if status was changed.

**Kind**: event emitted by [<code>Plug</code>](#Plug)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | emeterRealtime |

<a name="Device+event_polling-error"></a>

### "polling-error"
**Kind**: event emitted by [<code>Plug</code>](#Plug)  
**Overrides**: [<code>polling-error</code>](#Device+event_polling-error)  
**Properties**

| Name | Type |
| --- | --- |
| error | <code>Error</code> | 


<a name="SendOptions"></a>

## SendOptions : <code>Object</code>
Send Options.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| timeout | <code>number</code> | (ms) |
| transport | <code>string</code> | 'tcp','udp' |
| useSharedSocket | <code>boolean</code> | attempt to reuse a shared socket if available, UDP only |
| sharedSocketTimeout | <code>boolean</code> | (ms) how long to wait for another send before closing a shared socket. 0 = never automatically close socket |


<a name="ResponseError"></a>

## ResponseError ⇐ <code>Error</code>
Represents an error result received from a TP-Link device.

Where response err_code != 0.

**Kind**: global class  
**Extends**: <code>Error</code>  


## Credits

Thanks to George Georgovassilis and Thomas Baust for [figuring out the HS1XX encryption](https://blog.georgovassilis.com/2016/05/07/controlling-the-tp-link-hs100-wi-fi-smart-plug/).

Some design cues for Client based on [node-lifx](https://github.com/MariusRumpf/node-lifx/)
