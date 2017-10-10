# hs100-api
[![NPM Version](https://img.shields.io/npm/v/hs100-api.svg)](https://www.npmjs.com/package/hs100-api)
[![Build Status](https://travis-ci.org/plasticrake/hs100-api.svg?branch=master)](https://travis-ci.org/plasticrake/hs100-api)
[![codecov](https://codecov.io/gh/plasticrake/hs100-api/branch/master/graph/badge.svg)](https://codecov.io/gh/plasticrake/hs100-api)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

TP-Link Smart Home API

#### [Changelog](https://github.com/plasticrake/hs100-api/tree/master/CHANGELOG.md)

## Supported Devices

| Model                      | Type |
|----------------------------|------|
| HS100, HS105, HS110, HS200 | Plug |
| LB100, LB110, LB120, LB130 | Bulb |

I only have HS100, HS105 and HS110 (plugs), so I am unable to test Bulb support. I'd gladly accept pull requests to add features or equipment donations ([amazon wishlist](http://a.co/bw0EfsB)) so I can do my own development!

I have written a [TP-Link device simulator](https://github.com/plasticrake/tplink-smarthome-simulator) for automated testing that includes Bulbs. So while I don't have a physical Bulb to test with, I do have virtual ones!

## Examples
See more [examples](https://github.com/plasticrake/hs100-api/tree/master/examples).

```javascript
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
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
Install the command line utility with `npm install -g hs100-api`. Run `hs100-api --help` for help.

## API
The API is not stable (but it's getting close!) and there may be breaking changes.


* [Client](#Client) ⇐ <code>EventEmitter</code>
    * [new Client(options)](#new_Client_new)
    * [.send(options)](#Client+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getSysInfo(options)](#Client+getSysInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getBulb(options)](#Client+getBulb) ⇒ [<code>Bulb</code>](#Bulb)
    * [.getPlug(options)](#Client+getPlug) ⇒ [<code>Plug</code>](#Plug)
    * [.getDevice(options)](#Client+getDevice) ⇒ <code>Promise.&lt;(Plug\|Bulb), Error&gt;</code>
    * [.getCommonDevice(options)](#Client+getCommonDevice) ⇒ [<code>Device</code>](#Device)
    * [.getDeviceFromSysInfo(sysInfo, options)](#Client+getDeviceFromSysInfo) ⇒ [<code>Plug</code>](#Plug) \| [<code>Bulb</code>](#Bulb)
    * [.getTypeFromSysInfo(sysInfo)](#Client+getTypeFromSysInfo) ⇒ <code>string</code>
    * [.startDiscovery(options)](#Client+startDiscovery) ⇒ [<code>Client</code>](#Client)
    * [.stopDiscovery()](#Client+stopDiscovery)
    * ["error"](#Client+event_error)
    * ["device-new"](#Client+event_device-new)
    * ["device-online"](#Client+event_device-online)
    * ["device-offline"](#Client+event_device-offline)
    * ["bulb-new"](#Client+event_bulb-new)
    * ["bulb-online"](#Client+event_bulb-online)
    * ["bulb-offline"](#Client+event_bulb-offline)
    * ["plug-new"](#Client+event_plug-new)
    * ["plug-online"](#Client+event_plug-online)
    * ["plug-offline"](#Client+event_plug-offline)



* [Device](#Device) ⇐ <code>EventEmitter</code>
    * [new Device(options)](#new_Device_new)
    * [.sysInfo](#Device+sysInfo) ⇒ <code>Object</code>
    * [.emeterRealtime](#Device+emeterRealtime) ⇒ <code>Object</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.deviceName](#Device+deviceName) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.send(payload, [timeout])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [timeout])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([timeout])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias)](#Device+setAlias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getCloudInfo()](#Device+getCloudInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getEmeterRealtime()](#Device+getEmeterRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel()](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScanInfo([refresh], [timeoutInSeconds])](#Device+getScanInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleNextAction()](#Device+getScheduleNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleRules()](#Device+getScheduleRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTime()](#Device+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimeZone()](#Device+getTimeZone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>



* [Bulb](#Bulb) ⇐ [<code>Device</code>](#Device)
    * [new Bulb(options)](#new_Bulb_new)
    * [.sysInfo](#Bulb+sysInfo) ⇒ <code>Object</code>
    * [.lightState](#Bulb+lightState) ⇒ <code>Object</code>
    * [.supportsBrightness](#Bulb+supportsBrightness) ⇒ <code>boolean</code>
    * [.supportsColor](#Bulb+supportsColor) ⇒ <code>boolean</code>
    * [.supportsColorTemperature](#Bulb+supportsColorTemperature) ⇒ <code>boolean</code>
    * [.getColorTemperatureRange](#Bulb+getColorTemperatureRange) ⇒ <code>Object</code>
    * [.emeterRealtime](#Device+emeterRealtime) ⇒ <code>Object</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.deviceName](#Device+deviceName) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.getInfo()](#Bulb+getInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getLightState()](#Bulb+getLightState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setLightState(options)](#Bulb+setLightState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getPowerState()](#Bulb+getPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setPowerState(value)](#Bulb+setPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.send(payload, [timeout])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [timeout])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([timeout])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias)](#Device+setAlias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getCloudInfo()](#Device+getCloudInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getEmeterRealtime()](#Device+getEmeterRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel()](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScanInfo([refresh], [timeoutInSeconds])](#Device+getScanInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleNextAction()](#Device+getScheduleNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleRules()](#Device+getScheduleRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTime()](#Device+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimeZone()](#Device+getTimeZone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * ["lightstate-on"](#Bulb+event_lightstate-on)
    * ["lightstate-off"](#Bulb+event_lightstate-off)
    * ["lightstate-change"](#Bulb+event_lightstate-change)
    * ["lightstate-update"](#Bulb+event_lightstate-update)
    * ["emeter-realtime-update"](#Bulb+event_emeter-realtime-update)



* [Plug](#Plug) ⇐ [<code>Device</code>](#Device)
    * [new Plug(options)](#new_Plug_new)
    * [.sysInfo](#Plug+sysInfo) ⇒ <code>Object</code>
    * [.emeterRealtime](#Plug+emeterRealtime) ⇒ <code>Object</code>
    * [.inUse](#Plug+inUse) ⇒ <code>boolean</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.deviceName](#Device+deviceName) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.getInfo()](#Plug+getInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getAwayRules()](#Plug+getAwayRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getInUse()](#Plug+getInUse) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getLedState()](#Plug+getLedState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setLedState(value)](#Plug+setLedState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getPowerState()](#Plug+getPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setPowerState(value)](#Plug+setPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getTimerRules()](#Plug+getTimerRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.blink([times], [rate])](#Plug+blink) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.send(payload, [timeout])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [timeout])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([timeout])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias)](#Device+setAlias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getCloudInfo()](#Device+getCloudInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getEmeterRealtime()](#Device+getEmeterRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel()](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScanInfo([refresh], [timeoutInSeconds])](#Device+getScanInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleNextAction()](#Device+getScheduleNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleRules()](#Device+getScheduleRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTime()](#Device+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimeZone()](#Device+getTimeZone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * ["power-on"](#Plug+event_power-on)
    * ["power-off"](#Plug+event_power-off)
    * ["power-update"](#Plug+event_power-update)
    * ["in-use"](#Plug+event_in-use)
    * ["not-in-use"](#Plug+event_not-in-use)
    * ["in-use-update"](#Plug+event_in-use-update)
    * ["emeter-realtime-update"](#Plug+event_emeter-realtime-update)



* [tplink-crypto](#module_tplink-crypto)
    * [.encrypt(input, [firstKey])](#module_tplink-crypto.encrypt) ⇒ <code>Buffer</code>
    * [.encryptWithHeader(input, [firstKey])](#module_tplink-crypto.encryptWithHeader) ⇒ <code>Buffer</code>
    * [.decrypt(input, [firstKey])](#module_tplink-crypto.decrypt) ⇒ <code>Buffer</code>
    * [.decryptWithHeader(input, [firstKey])](#module_tplink-crypto.decryptWithHeader) ⇒ <code>Buffer</code>



<a name="Client"></a>

## Client ⇐ <code>EventEmitter</code>
Client that sends commands to specified devices or discover devices on the local subnet.
- Contains factory methods to create devices.
- Events are emitted after [#startDiscovery](#startDiscovery) is called.

**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

* [Client](#Client) ⇐ <code>EventEmitter</code>
    * [new Client(options)](#new_Client_new)
    * [.send(options)](#Client+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getSysInfo(options)](#Client+getSysInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getBulb(options)](#Client+getBulb) ⇒ [<code>Bulb</code>](#Bulb)
    * [.getPlug(options)](#Client+getPlug) ⇒ [<code>Plug</code>](#Plug)
    * [.getDevice(options)](#Client+getDevice) ⇒ <code>Promise.&lt;(Plug\|Bulb), Error&gt;</code>
    * [.getCommonDevice(options)](#Client+getCommonDevice) ⇒ [<code>Device</code>](#Device)
    * [.getDeviceFromSysInfo(sysInfo, options)](#Client+getDeviceFromSysInfo) ⇒ [<code>Plug</code>](#Plug) \| [<code>Bulb</code>](#Bulb)
    * [.getTypeFromSysInfo(sysInfo)](#Client+getTypeFromSysInfo) ⇒ <code>string</code>
    * [.startDiscovery(options)](#Client+startDiscovery) ⇒ [<code>Client</code>](#Client)
    * [.stopDiscovery()](#Client+stopDiscovery)
    * ["error"](#Client+event_error)
    * ["device-new"](#Client+event_device-new)
    * ["device-online"](#Client+event_device-online)
    * ["device-offline"](#Client+event_device-offline)
    * ["bulb-new"](#Client+event_bulb-new)
    * ["bulb-online"](#Client+event_bulb-online)
    * ["bulb-offline"](#Client+event_bulb-offline)
    * ["plug-new"](#Client+event_plug-new)
    * ["plug-online"](#Client+event_plug-online)
    * ["plug-offline"](#Client+event_plug-offline)

<a name="new_Client_new"></a>

### new Client(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.timeout] | <code>number</code> | <code>5000</code> | default timeout for network operations |
| [options.logLevel] | <code>string</code> |  | level for built in logger ['error','warn','info','debug','trace'] |

<a name="Client+send"></a>

### client.send(options) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
[Encrypts](#module_tplink-crypto) `payload` and sends (via TCP) to device.
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

All responses contain an `err_code` (`0` is success).

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| options.host | <code>string</code> |  | 
| [options.port] | <code>number</code> | <code>9999</code> | 
| options.payload | <code>Object</code> \| <code>string</code> |  | 
| [options.timeout] | <code>number</code> | <code>this.timeout</code> | 

<a name="Client+getSysInfo"></a>

### client.getSysInfo(options) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests `{system:{get_sysinfo:{}}}` from device.

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.host | <code>string</code> |  |  |
| [options.port] | <code>number</code> | <code>9999</code> |  |
| [options.timeout] | <code>number</code> | <code>this.timeout</code> | timeout for request |

<a name="Client+getBulb"></a>

### client.getBulb(options) ⇒ [<code>Bulb</code>](#Bulb)
Creates Bulb object.

See [Device#constructor](Device#constructor) and [Bulb#constructor](Bulb#constructor) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | passed to [Bulb#constructor](Bulb#constructor) |

<a name="Client+getPlug"></a>

### client.getPlug(options) ⇒ [<code>Plug</code>](#Plug)
Creates [Plug](#Plug) object.

See [Device#constructor](Device#constructor) and [Plug#constructor](Plug#constructor) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | passed to [Plug#constructor](Plug#constructor) |

<a name="Client+getDevice"></a>

### client.getDevice(options) ⇒ <code>Promise.&lt;(Plug\|Bulb), Error&gt;</code>
Creates a [Plug](#Plug) or [Bulb](#Bulb) after querying device to determine type.

See [Device#constructor](Device#constructor), [Bulb#constructor](Bulb#constructor), [Plug#constructor](Plug#constructor) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | passed to [Device#constructor](Device#constructor) |

<a name="Client+getCommonDevice"></a>

### client.getCommonDevice(options) ⇒ [<code>Device</code>](#Device)
Create [Device](#Device) object.
- Device object only supports common Device methods.
- See [Device#constructor](Device#constructor) for valid options.
- Instead use [#getDevice](#getDevice) to create a fully featured object.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | passed to [Device#constructor](Device#constructor) |

<a name="Client+getDeviceFromSysInfo"></a>

### client.getDeviceFromSysInfo(sysInfo, options) ⇒ [<code>Plug</code>](#Plug) \| [<code>Bulb</code>](#Bulb)
Creates device corresponding to the provided `sysInfo`.

See [Device#constructor](Device#constructor), [Bulb#constructor](Bulb#constructor), [Plug#constructor](Plug#constructor) for valid options

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| sysInfo | <code>Object</code> |  |
| options | <code>Object</code> | passed to device constructor |

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
  - If a device does not respond after `offlineTolerance` number of attempts, [event:device-offline](event:device-offline) is emitted.
- If `deviceTypes` are specified only matching devices are found.
- If `macAddresses` are specified only matching device with matching MAC addresses are found.
- If `devices` are specified it will attempt to contact them directly in addition to sending to the broadcast address.
  - `devices` are specified as an array of `[{host, [port: 9999]}]`.

**Kind**: instance method of [<code>Client</code>](#Client)  
**Returns**: [<code>Client</code>](#Client) - this  
**Emits**: [<code>error</code>](#Client+event_error), [<code>device-new</code>](#Client+event_device-new), [<code>device-online</code>](#Client+event_device-online), [<code>device-offline</code>](#Client+event_device-offline), [<code>bulb-new</code>](#Client+event_bulb-new), [<code>bulb-online</code>](#Client+event_bulb-online), [<code>bulb-offline</code>](#Client+event_bulb-offline), [<code>plug-new</code>](#Client+event_plug-new), [<code>plug-online</code>](#Client+event_plug-online), [<code>plug-offline</code>](#Client+event_plug-offline)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.address] | <code>string</code> |  | address to bind udp socket |
| [options.port] | <code>number</code> |  | port to bind udp socket |
| [options.broadcast] | <code>string</code> | <code>&quot;&#x27;255.255.255.255&#x27;&quot;</code> | broadcast address |
| [options.discoveryInterval] | <code>number</code> | <code>10000</code> | (ms) |
| [options.discoveryTimeout] | <code>number</code> | <code>0</code> | (ms) |
| [options.offlineTolerance] | <code>number</code> | <code>3</code> |  |
| [options.deviceTypes] | <code>Array.&lt;string&gt;</code> |  | 'plug','bulb' |
| [options.macAddresses] | <code>Array.&lt;string&gt;</code> |  | 'plug','bulb' |
| [options.deviceOptions] | <code>Object</code> | <code>{}</code> | passed to device constructors |
| [options.devices] | <code>Array.&lt;Object&gt;</code> |  | known devices to query instead of relying on broadcast |

<a name="Client+stopDiscovery"></a>

### client.stopDiscovery()
Stops discovery and closes UDP socket.

**Kind**: instance method of [<code>Client</code>](#Client)  
<a name="Client+event_error"></a>

### "error"
Error during discovery.

**Kind**: event emitted by [<code>Client</code>](#Client)  
**Properties**

| Type |
| --- |
| <code>Error</code> | 

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


<a name="Device"></a>

## Device ⇐ <code>EventEmitter</code>
TP-Link Device.

Shared behavior for [Plug](#Plug) and [Bulb](#Bulb).

**Kind**: global class  
**Extends**: <code>EventEmitter</code>  
**Emits**: <code>Device#event:emeter-realtime-update</code>  

* [Device](#Device) ⇐ <code>EventEmitter</code>
    * [new Device(options)](#new_Device_new)
    * [.sysInfo](#Device+sysInfo) ⇒ <code>Object</code>
    * [.emeterRealtime](#Device+emeterRealtime) ⇒ <code>Object</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.deviceName](#Device+deviceName) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.send(payload, [timeout])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [timeout])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([timeout])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias)](#Device+setAlias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getCloudInfo()](#Device+getCloudInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getEmeterRealtime()](#Device+getEmeterRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel()](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScanInfo([refresh], [timeoutInSeconds])](#Device+getScanInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleNextAction()](#Device+getScheduleNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleRules()](#Device+getScheduleRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTime()](#Device+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimeZone()](#Device+getTimeZone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="new_Device_new"></a>

### new Device(options)
Created by [Client#getGeneralDevice](Client#getGeneralDevice) - Do not instantiate directly


| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| options.client | [<code>Client</code>](#Client) |  | 
| options.host | <code>string</code> |  | 
| [options.port] | <code>number</code> | <code>9999</code> | 
| [options.seenOnDiscovery] | <code>number</code> |  | 
| [options.timeout] | <code>number</code> |  | 
| [options.logger] | <code>Object</code> |  | 

<a name="Device+sysInfo"></a>

### device.sysInfo ⇒ <code>Object</code>
Returns cached results from last retrieval of `system.sys_info`.

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>Object</code> - system.sys_info  
<a name="Device+emeterRealtime"></a>

### device.emeterRealtime ⇒ <code>Object</code>
Returns cached results from last retrieval of `emeter.get_realtime`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+alias"></a>

### device.alias ⇒ <code>string</code>
sys_info.alias

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+deviceId"></a>

### device.deviceId ⇒ <code>string</code>
sys_info.deviceId

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+deviceName"></a>

### device.deviceName ⇒ <code>string</code>
sys_info.dev_name

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+model"></a>

### device.model ⇒ <code>string</code>
sys_info.model

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+name"></a>

### device.name ⇒ <code>string</code>
sys_info.alias

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+type"></a>

### device.type ⇒ <code>string</code>
sys_info.[type|mic_type]

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+deviceType"></a>

### device.deviceType ⇒ <code>string</code>
Type of device (or device if unknown)

Based on sys_info.[type|mic_type]

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>string</code> - 'plub'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### device.softwareVersion ⇒ <code>string</code>
sys_info.sw_ver

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+hardwareVersion"></a>

### device.hardwareVersion ⇒ <code>string</code>
sys_info.hw_ver

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+mac"></a>

### device.mac ⇒ <code>string</code>
sys_info.[mac|mic_mac|ethernet_mac]

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+send"></a>

### device.send(payload, [timeout]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type | Default |
| --- | --- | --- |
| payload | <code>Object</code> \| <code>string</code> |  | 
| [timeout] | <code>number</code> | <code></code> | 

<a name="Device+sendCommand"></a>

### device.sendCommand(command, [timeout]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for comand.\
    Example: `{system:{get_sysinfo:{}}}`
    - resolves to: `{err_code:0,...}`\
    - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as [#send](#send) would)
- If more than one operation was sent:
  - Promise fulfills with full parsed JSON response (same as [#send](#send))

Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with [ResponseError](#ResponseError).

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| command | <code>Object</code> \| <code>string</code> | 
| [timeout] | <code>number</code> | 

<a name="Device+startPolling"></a>

### device.startPolling(interval) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
Polls the device every `interval`.

Returns `this` (for chaining) that emits events based on state changes.
Refer to specific device sections for event details.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) - this  

| Param | Type | Description |
| --- | --- | --- |
| interval | <code>number</code> | (ms) |

<a name="Device+stopPolling"></a>

### device.stopPolling()
Stops device polling.

**Kind**: instance method of [<code>Device</code>](#Device)  
<a name="Device+getSysInfo"></a>

### device.getSysInfo([timeout]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [timeout] | <code>number</code> | 

<a name="Device+setAlias"></a>

### device.setAlias(alias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 

<a name="Device+getCloudInfo"></a>

### device.getCloudInfo() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's TP-Link Cloud info.

Requests `cloud.get_info`.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getEmeterRealtime"></a>

### device.getEmeterRealtime() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's current energy stats.

Requests `emeter.get_realtime`.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getModel"></a>

### device.getModel() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getScanInfo"></a>

### device.getScanInfo([refresh], [timeoutInSeconds]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Requests `netif.get_scaninfo` (list of WiFi networks).

Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
The network timeout for the request is calculated by adding the
default network timeout to the request timeout.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [refresh] | <code>Boolean</code> | <code>false</code> | request device's cached results |
| [timeoutInSeconds] | <code>number</code> | <code>10</code> | timeout for scan in seconds |

<a name="Device+getScheduleNextAction"></a>

### device.getScheduleNextAction() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Next Schedule Rule Action.

Requests `schedule.get_next_action`.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getScheduleRules"></a>

### device.getScheduleRules() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getTime"></a>

### device.getTime() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's time.

Requests `timesetting.get_time`.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getTimeZone"></a>

### device.getTimeZone() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

<a name="Bulb"></a>

## Bulb ⇐ [<code>Device</code>](#Device)
Bulb Device.

TP-Link models: LB100, LB110, LB120, LB130.

**Kind**: global class  
**Extends**: [<code>Device</code>](#Device), <code>EventEmitter</code>  
**Emits**: [<code>lightstate-on</code>](#Bulb+event_lightstate-on), [<code>lightstate-off</code>](#Bulb+event_lightstate-off), [<code>lightstate-change</code>](#Bulb+event_lightstate-change), [<code>lightstate-update</code>](#Bulb+event_lightstate-update), [<code>emeter-realtime-update</code>](#Bulb+event_emeter-realtime-update)  

* [Bulb](#Bulb) ⇐ [<code>Device</code>](#Device)
    * [new Bulb(options)](#new_Bulb_new)
    * [.sysInfo](#Bulb+sysInfo) ⇒ <code>Object</code>
    * [.lightState](#Bulb+lightState) ⇒ <code>Object</code>
    * [.supportsBrightness](#Bulb+supportsBrightness) ⇒ <code>boolean</code>
    * [.supportsColor](#Bulb+supportsColor) ⇒ <code>boolean</code>
    * [.supportsColorTemperature](#Bulb+supportsColorTemperature) ⇒ <code>boolean</code>
    * [.getColorTemperatureRange](#Bulb+getColorTemperatureRange) ⇒ <code>Object</code>
    * [.emeterRealtime](#Device+emeterRealtime) ⇒ <code>Object</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.deviceName](#Device+deviceName) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.getInfo()](#Bulb+getInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getLightState()](#Bulb+getLightState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setLightState(options)](#Bulb+setLightState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getPowerState()](#Bulb+getPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setPowerState(value)](#Bulb+setPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.send(payload, [timeout])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [timeout])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([timeout])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias)](#Device+setAlias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getCloudInfo()](#Device+getCloudInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getEmeterRealtime()](#Device+getEmeterRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel()](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScanInfo([refresh], [timeoutInSeconds])](#Device+getScanInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleNextAction()](#Device+getScheduleNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleRules()](#Device+getScheduleRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTime()](#Device+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimeZone()](#Device+getTimeZone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * ["lightstate-on"](#Bulb+event_lightstate-on)
    * ["lightstate-off"](#Bulb+event_lightstate-off)
    * ["lightstate-change"](#Bulb+event_lightstate-change)
    * ["lightstate-update"](#Bulb+event_lightstate-update)
    * ["emeter-realtime-update"](#Bulb+event_emeter-realtime-update)

<a name="new_Bulb_new"></a>

### new Bulb(options)
Created by [Client](#Client) - Do not instantiate directly.

See [Device#constructor](Device#constructor) for common options.


| Param | Type |
| --- | --- |
| options | <code>Object</code> | 

<a name="Bulb+sysInfo"></a>

### bulb.sysInfo ⇒ <code>Object</code>
Returns cached results from last retrieval of `system.sys_info`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>sysInfo</code>](#Device+sysInfo)  
**Returns**: <code>Object</code> - system.sys_info  
<a name="Bulb+lightState"></a>

### bulb.lightState ⇒ <code>Object</code>
Returns cached results from last retrieval of `smartlife.iot.smartbulb.lightingservice.get_light_state`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+supportsBrightness"></a>

### bulb.supportsBrightness ⇒ <code>boolean</code>
sys_info.is_dimmable === 1

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+supportsColor"></a>

### bulb.supportsColor ⇒ <code>boolean</code>
sys_info.is_color === 1

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+supportsColorTemperature"></a>

### bulb.supportsColorTemperature ⇒ <code>boolean</code>
sys_info.is_variable_color_temp === 1

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+getColorTemperatureRange"></a>

### bulb.getColorTemperatureRange ⇒ <code>Object</code>
Returns array with min and max supported color temperatures

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Object</code> - range  
<a name="Device+emeterRealtime"></a>

### bulb.emeterRealtime ⇒ <code>Object</code>
Returns cached results from last retrieval of `emeter.get_realtime`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Overrides**: [<code>emeterRealtime</code>](#Device+emeterRealtime)  
<a name="Device+alias"></a>

### bulb.alias ⇒ <code>string</code>
sys_info.alias

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+deviceId"></a>

### bulb.deviceId ⇒ <code>string</code>
sys_info.deviceId

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+deviceName"></a>

### bulb.deviceName ⇒ <code>string</code>
sys_info.dev_name

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+model"></a>

### bulb.model ⇒ <code>string</code>
sys_info.model

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+name"></a>

### bulb.name ⇒ <code>string</code>
sys_info.alias

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+type"></a>

### bulb.type ⇒ <code>string</code>
sys_info.[type|mic_type]

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+deviceType"></a>

### bulb.deviceType ⇒ <code>string</code>
Type of device (or device if unknown)

Based on sys_info.[type|mic_type]

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>string</code> - 'plub'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### bulb.softwareVersion ⇒ <code>string</code>
sys_info.sw_ver

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+hardwareVersion"></a>

### bulb.hardwareVersion ⇒ <code>string</code>
sys_info.hw_ver

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+mac"></a>

### bulb.mac ⇒ <code>string</code>
sys_info.[mac|mic_mac|ethernet_mac]

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+getInfo"></a>

### bulb.getInfo() ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests common Bulb status details in a single request.
- `system.get_sysinfo`
- `cloud.get_sysinfo`
- `emeter.get_realtime`
- `schedule.get_next_action`

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  
<a name="Bulb+getLightState"></a>

### bulb.getLightState() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Bulb light state.

Requests `lightingservice.get_light_state`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Bulb+setLightState"></a>

### bulb.setLightState(options) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Sets Bulb light state (on/off, brightness, color, etc).

Sends `lightingservice.transition_light_state` command.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.ignore_default | <code>number</code> | 1=true, 0=false |
| options.transition_period | <code>number</code> |  |
| options.on_off | <code>number</code> | 1=on, 0=off |
| options.mode | <code>string</code> |  |
| options.hue | <code>number</code> | 0-360 |
| options.saturation | <code>number</code> | 0-100 |
| options.brightness | <code>number</code> | 0-100 |
| options.color_temp | <code>number</code> | Kelvin (LB120:2700-6500 LB130:2500-9000) |

<a name="Bulb+getPowerState"></a>

### bulb.getPowerState() ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Gets on/off state of Bulb.

Requests `lightingservice.get_light_state` and returns true if `on_off === 1`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
<a name="Bulb+setPowerState"></a>

### bulb.setPowerState(value) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Sets on/off state of Bulb.

Sends `lightingservice.transition_light_state` command with on_off `value`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | true: on, false: off |

<a name="Device+send"></a>

### bulb.send(payload, [timeout]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type | Default |
| --- | --- | --- |
| payload | <code>Object</code> \| <code>string</code> |  | 
| [timeout] | <code>number</code> | <code></code> | 

<a name="Device+sendCommand"></a>

### bulb.sendCommand(command, [timeout]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for comand.\
    Example: `{system:{get_sysinfo:{}}}`
    - resolves to: `{err_code:0,...}`\
    - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as [#send](#send) would)
- If more than one operation was sent:
  - Promise fulfills with full parsed JSON response (same as [#send](#send))

Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with [ResponseError](#ResponseError).

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| command | <code>Object</code> \| <code>string</code> | 
| [timeout] | <code>number</code> | 

<a name="Device+startPolling"></a>

### bulb.startPolling(interval) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
Polls the device every `interval`.

Returns `this` (for chaining) that emits events based on state changes.
Refer to specific device sections for event details.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) - this  

| Param | Type | Description |
| --- | --- | --- |
| interval | <code>number</code> | (ms) |

<a name="Device+stopPolling"></a>

### bulb.stopPolling()
Stops device polling.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
<a name="Device+getSysInfo"></a>

### bulb.getSysInfo([timeout]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [timeout] | <code>number</code> | 

<a name="Device+setAlias"></a>

### bulb.setAlias(alias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 

<a name="Device+getCloudInfo"></a>

### bulb.getCloudInfo() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's TP-Link Cloud info.

Requests `cloud.get_info`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getEmeterRealtime"></a>

### bulb.getEmeterRealtime() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's current energy stats.

Requests `emeter.get_realtime`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getModel"></a>

### bulb.getModel() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getScanInfo"></a>

### bulb.getScanInfo([refresh], [timeoutInSeconds]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Requests `netif.get_scaninfo` (list of WiFi networks).

Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
The network timeout for the request is calculated by adding the
default network timeout to the request timeout.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [refresh] | <code>Boolean</code> | <code>false</code> | request device's cached results |
| [timeoutInSeconds] | <code>number</code> | <code>10</code> | timeout for scan in seconds |

<a name="Device+getScheduleNextAction"></a>

### bulb.getScheduleNextAction() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Next Schedule Rule Action.

Requests `schedule.get_next_action`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getScheduleRules"></a>

### bulb.getScheduleRules() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getTime"></a>

### bulb.getTime() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's time.

Requests `timesetting.get_time`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getTimeZone"></a>

### bulb.getTimeZone() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
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

<a name="Bulb+event_emeter-realtime-update"></a>

### "emeter-realtime-update"
Bulb's Energy Monitoring Details were updated from device. Fired regardless if status was changed.

**Kind**: event emitted by [<code>Bulb</code>](#Bulb)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| value | <code>Object</code> | emeterRealtime |


<a name="Plug"></a>

## Plug ⇐ [<code>Device</code>](#Device)
Plug Device.

TP-Link models: HS100, HS105, HS110, HS200.

Emits events after device status is queried, such as [#getSysInfo](#getSysInfo) and [#getEmeterRealtime](#getEmeterRealtime).

**Kind**: global class  
**Extends**: [<code>Device</code>](#Device), <code>EventEmitter</code>  
**Emits**: [<code>power-on</code>](#Plug+event_power-on), [<code>power-off</code>](#Plug+event_power-off), [<code>power-update</code>](#Plug+event_power-update), [<code>in-use</code>](#Plug+event_in-use), [<code>not-in-use</code>](#Plug+event_not-in-use), [<code>in-use-update</code>](#Plug+event_in-use-update), [<code>emeter-realtime-update</code>](#Plug+event_emeter-realtime-update)  

* [Plug](#Plug) ⇐ [<code>Device</code>](#Device)
    * [new Plug(options)](#new_Plug_new)
    * [.sysInfo](#Plug+sysInfo) ⇒ <code>Object</code>
    * [.emeterRealtime](#Plug+emeterRealtime) ⇒ <code>Object</code>
    * [.inUse](#Plug+inUse) ⇒ <code>boolean</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
    * [.deviceId](#Device+deviceId) ⇒ <code>string</code>
    * [.deviceName](#Device+deviceName) ⇒ <code>string</code>
    * [.model](#Device+model) ⇒ <code>string</code>
    * [.name](#Device+name) ⇒ <code>string</code>
    * [.type](#Device+type) ⇒ <code>string</code>
    * [.deviceType](#Device+deviceType) ⇒ <code>string</code>
    * [.softwareVersion](#Device+softwareVersion) ⇒ <code>string</code>
    * [.hardwareVersion](#Device+hardwareVersion) ⇒ <code>string</code>
    * [.mac](#Device+mac) ⇒ <code>string</code>
    * [.getInfo()](#Plug+getInfo) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.getAwayRules()](#Plug+getAwayRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getInUse()](#Plug+getInUse) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getLedState()](#Plug+getLedState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setLedState(value)](#Plug+setLedState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getPowerState()](#Plug+getPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setPowerState(value)](#Plug+setPowerState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.getTimerRules()](#Plug+getTimerRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.blink([times], [rate])](#Plug+blink) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.send(payload, [timeout])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [timeout])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([timeout])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias)](#Device+setAlias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getCloudInfo()](#Device+getCloudInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getEmeterRealtime()](#Device+getEmeterRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel()](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScanInfo([refresh], [timeoutInSeconds])](#Device+getScanInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleNextAction()](#Device+getScheduleNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getScheduleRules()](#Device+getScheduleRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTime()](#Device+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimeZone()](#Device+getTimeZone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * ["power-on"](#Plug+event_power-on)
    * ["power-off"](#Plug+event_power-off)
    * ["power-update"](#Plug+event_power-update)
    * ["in-use"](#Plug+event_in-use)
    * ["not-in-use"](#Plug+event_not-in-use)
    * ["in-use-update"](#Plug+event_in-use-update)
    * ["emeter-realtime-update"](#Plug+event_emeter-realtime-update)

<a name="new_Plug_new"></a>

### new Plug(options)
Created by [Client](#Client) - Do not instantiate directly.

See [Device#constructor](Device#constructor) for common options.


| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| [options.inUseThreshold] | <code>Number</code> | <code>0</code> | 

<a name="Plug+sysInfo"></a>

### plug.sysInfo ⇒ <code>Object</code>
Returns cached results from last retrieval of `system.sys_info`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>sysInfo</code>](#Device+sysInfo)  
**Returns**: <code>Object</code> - system.sys_info  
<a name="Plug+emeterRealtime"></a>

### plug.emeterRealtime ⇒ <code>Object</code>
Returns cached results from last retrieval of `emeter.get_realtime`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Overrides**: [<code>emeterRealtime</code>](#Device+emeterRealtime)  
<a name="Plug+inUse"></a>

### plug.inUse ⇒ <code>boolean</code>
Determines if device is in use based on cached `emeter.get_realtime` results.

If device supports energy monitoring (HS110): `power > inUseThreshold`

Otherwise fallback on relay state:  `relay_state === 1`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+alias"></a>

### plug.alias ⇒ <code>string</code>
sys_info.alias

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+deviceId"></a>

### plug.deviceId ⇒ <code>string</code>
sys_info.deviceId

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+deviceName"></a>

### plug.deviceName ⇒ <code>string</code>
sys_info.dev_name

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+model"></a>

### plug.model ⇒ <code>string</code>
sys_info.model

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+name"></a>

### plug.name ⇒ <code>string</code>
sys_info.alias

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+type"></a>

### plug.type ⇒ <code>string</code>
sys_info.[type|mic_type]

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+deviceType"></a>

### plug.deviceType ⇒ <code>string</code>
Type of device (or device if unknown)

Based on sys_info.[type|mic_type]

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Returns**: <code>string</code> - 'plub'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### plug.softwareVersion ⇒ <code>string</code>
sys_info.sw_ver

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+hardwareVersion"></a>

### plug.hardwareVersion ⇒ <code>string</code>
sys_info.hw_ver

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+mac"></a>

### plug.mac ⇒ <code>string</code>
sys_info.[mac|mic_mac|ethernet_mac]

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Plug+getInfo"></a>

### plug.getInfo() ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests common Plug status details in a single request.
- `system.get_sysinfo`
- `cloud.get_sysinfo`
- `emeter.get_realtime`
- `schedule.get_next_action`

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  
<a name="Plug+getAwayRules"></a>

### plug.getAwayRules() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Away Rules.

Requests `anti_theft.get_rules`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Plug+getInUse"></a>

### plug.getInUse() ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Same as [#inUse](#inUse), but requests current `emeter.get_realtime`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
<a name="Plug+getLedState"></a>

### plug.getLedState() ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug LED state (night mode).

Requests `system.sys_info` and returns true if `led_off === 0`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;boolean, ResponseError&gt;</code> - LED State, true === on  
<a name="Plug+setLedState"></a>

### plug.setLedState(value) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Turn Plug LED on/off (night mode).

Sends `system.set_led_off` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | LED State, true === on |

<a name="Plug+getPowerState"></a>

### plug.getPowerState() ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug relay state (on/off).

Requests `system.get_sysinfo` and returns true if `relay_state === 1`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
<a name="Plug+setPowerState"></a>

### plug.setPowerState(value) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Turns Plug relay on/off.

Sends `system.set_relay_state` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| value | <code>boolean</code> | 

<a name="Plug+getTimerRules"></a>

### plug.getTimerRules() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Timer Rules.

Requests `count_down.get_rules`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Plug+blink"></a>

### plug.blink([times], [rate]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Blink Plug LED.

Sends `system.set_led_off` command alternating on and off number of `times` at `rate`,
then sets the led to its pre-blink state.

Note: `system.set_led_off` is particulally slow, so blink rate is not guaranteed.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type | Default |
| --- | --- | --- |
| [times] | <code>number</code> | <code>5</code> | 
| [rate] | <code>number</code> | <code>1000</code> | 

<a name="Device+send"></a>

### plug.send(payload, [timeout]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type | Default |
| --- | --- | --- |
| payload | <code>Object</code> \| <code>string</code> |  | 
| [timeout] | <code>number</code> | <code></code> | 

<a name="Device+sendCommand"></a>

### plug.sendCommand(command, [timeout]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for comand.\
    Example: `{system:{get_sysinfo:{}}}`
    - resolves to: `{err_code:0,...}`\
    - instead of: `{system:{get_sysinfo:{err_code:0,...}}}` (as [#send](#send) would)
- If more than one operation was sent:
  - Promise fulfills with full parsed JSON response (same as [#send](#send))

Also, the response's `err_code`(s) are checked, if any are missing or != `0` the Promise is rejected with [ResponseError](#ResponseError).

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| command | <code>Object</code> \| <code>string</code> | 
| [timeout] | <code>number</code> | 

<a name="Device+startPolling"></a>

### plug.startPolling(interval) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
Polls the device every `interval`.

Returns `this` (for chaining) that emits events based on state changes.
Refer to specific device sections for event details.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug) - this  

| Param | Type | Description |
| --- | --- | --- |
| interval | <code>number</code> | (ms) |

<a name="Device+stopPolling"></a>

### plug.stopPolling()
Stops device polling.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
<a name="Device+getSysInfo"></a>

### plug.getSysInfo([timeout]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [timeout] | <code>number</code> | 

<a name="Device+setAlias"></a>

### plug.setAlias(alias) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 

<a name="Device+getCloudInfo"></a>

### plug.getCloudInfo() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's TP-Link Cloud info.

Requests `cloud.get_info`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getEmeterRealtime"></a>

### plug.getEmeterRealtime() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's current energy stats.

Requests `emeter.get_realtime`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getModel"></a>

### plug.getModel() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getScanInfo"></a>

### plug.getScanInfo([refresh], [timeoutInSeconds]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Requests `netif.get_scaninfo` (list of WiFi networks).

Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
The network timeout for the request is calculated by adding the
default network timeout to the request timeout.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [refresh] | <code>Boolean</code> | <code>false</code> | request device's cached results |
| [timeoutInSeconds] | <code>number</code> | <code>10</code> | timeout for scan in seconds |

<a name="Device+getScheduleNextAction"></a>

### plug.getScheduleNextAction() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Next Schedule Rule Action.

Requests `schedule.get_next_action`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getScheduleRules"></a>

### plug.getScheduleRules() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getTime"></a>

### plug.getTime() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's time.

Requests `timesetting.get_time`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
<a name="Device+getTimeZone"></a>

### plug.getTimeZone() ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  
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


<a name="module_tplink-crypto"></a>

## tplink-crypto
TP-Link device crypto.

TCP communication includes a 4 byte header, UDP does not.


* [tplink-crypto](#module_tplink-crypto)
    * [.encrypt(input, [firstKey])](#module_tplink-crypto.encrypt) ⇒ <code>Buffer</code>
    * [.encryptWithHeader(input, [firstKey])](#module_tplink-crypto.encryptWithHeader) ⇒ <code>Buffer</code>
    * [.decrypt(input, [firstKey])](#module_tplink-crypto.decrypt) ⇒ <code>Buffer</code>
    * [.decryptWithHeader(input, [firstKey])](#module_tplink-crypto.decryptWithHeader) ⇒ <code>Buffer</code>

<a name="module_tplink-crypto.encrypt"></a>

### tplink-crypto.encrypt(input, [firstKey]) ⇒ <code>Buffer</code>
Encrypts input where each byte is XOR'd with the previous encrypted byte.

**Kind**: static method of [<code>tplink-crypto</code>](#module_tplink-crypto)  
**Returns**: <code>Buffer</code> - encrypted buffer  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| input | <code>string</code> |  | string to encrypt |
| [firstKey] | <code>number</code> | <code>0xAB</code> |  |

<a name="module_tplink-crypto.encryptWithHeader"></a>

### tplink-crypto.encryptWithHeader(input, [firstKey]) ⇒ <code>Buffer</code>
Encrypts input that has a 4 byte big-endian length header;
each byte is XOR'd with the previous encrypted byte.

**Kind**: static method of [<code>tplink-crypto</code>](#module_tplink-crypto)  
**Returns**: <code>Buffer</code> - encrypted buffer with header  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| input | <code>string</code> |  | string to encrypt |
| [firstKey] | <code>number</code> | <code>0xAB</code> |  |

<a name="module_tplink-crypto.decrypt"></a>

### tplink-crypto.decrypt(input, [firstKey]) ⇒ <code>Buffer</code>
Decrypts input where each byte is XOR'd with the previous encrypted byte.

**Kind**: static method of [<code>tplink-crypto</code>](#module_tplink-crypto)  
**Returns**: <code>Buffer</code> - decrypted buffer  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| input | <code>Buffer</code> \| <code>string</code> |  | encrypted Buffer/string |
| [firstKey] | <code>number</code> | <code>0xAB</code> |  |

<a name="module_tplink-crypto.decryptWithHeader"></a>

### tplink-crypto.decryptWithHeader(input, [firstKey]) ⇒ <code>Buffer</code>
Decrypts input that has a 4 bype big-endian length header;
each byte is XOR'd with the previous encrypted byte

**Kind**: static method of [<code>tplink-crypto</code>](#module_tplink-crypto)  
**Returns**: <code>Buffer</code> - decrypted buffer  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| input | <code>Buffer</code> \| <code>string</code> |  | encrypted Buffer/string with header |
| [firstKey] | <code>number</code> | <code>0xAB</code> |  |




## Credits
Thanks to George Georgovassilis and Thomas Baust for figuring out the HS1XX encryption.
https://georgovassilis.blogspot.com/2016/05/controlling-tp-link-hs100-wi-fi-smart.html

Some design cues for Client based on https://github.com/MariusRumpf/node-lifx/
