## Modules

<dl>
<dt><a href="#module_tplink-smarthome-api">tplink-smarthome-api</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#Bulb">Bulb</a> ⇐ <code><a href="#Device">Device</a></code></dt>
<dd><p>Bulb Device.</p>
<p>TP-Link models: LB100, LB110, LB120, LB130.</p>
</dd>
<dt><a href="#Lighting">Lighting</a></dt>
<dd><p>Lighting</p>
</dd>
<dt><a href="#BulbSchedule">BulbSchedule</a></dt>
<dd><p>BulbSchedule</p>
</dd>
<dt><a href="#Client">Client</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>Client that sends commands to specified devices or discover devices on the local subnet.</p>
<ul>
<li>Contains factory methods to create devices.</li>
<li>Events are emitted after <a href="#startDiscovery">#startDiscovery</a> is called.</li>
</ul>
</dd>
<dt><a href="#Device">Device</a> ⇐ <code>EventEmitter</code></dt>
<dd><p>TP-Link Device.</p>
<p>Shared behavior for <a href="#Plug">Plug</a> and <a href="#Bulb">Bulb</a>.</p>
</dd>
<dt><a href="#Netif">Netif</a></dt>
<dd><p>Netif</p>
</dd>
<dt><a href="#Away">Away</a></dt>
<dd><p>Away</p>
</dd>
<dt><a href="#Plug">Plug</a> ⇐ <code><a href="#Device">Device</a></code></dt>
<dd><p>Plug Device.</p>
<p>TP-Link models: HS100, HS105, HS110, HS200.</p>
<p>Emits events after device status is queried, such as <a href="#getSysInfo">#getSysInfo</a> and <a href="#getEmeterRealtime">#getEmeterRealtime</a>.</p>
</dd>
<dt><a href="#PlugSchedule">PlugSchedule</a></dt>
<dd><p>PlugSchedule</p>
</dd>
<dt><a href="#Timer">Timer</a></dt>
<dd><p>Timer</p>
</dd>
<dt><a href="#Cloud">Cloud</a></dt>
<dd><p>Cloud</p>
</dd>
<dt><a href="#Emeter">Emeter</a></dt>
<dd><p>Eemter</p>
</dd>
<dt><a href="#Schedule">Schedule</a></dt>
<dd><p>Schedule</p>
</dd>
<dt><a href="#Time">Time</a></dt>
<dd><p>Time</p>
</dd>
<dt><a href="#ResponseError">ResponseError</a> ⇐ <code>Error</code></dt>
<dd><p>Represents an error result received from a TP-Link device.</p>
<p>Where response err_code != 0.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SendOptions">SendOptions</a> : <code>Object</code></dt>
<dd><p>Send Options.</p>
</dd>
</dl>

<a name="module_tplink-smarthome-api"></a>

## tplink-smarthome-api
<a name="Bulb"></a>

## Bulb ⇐ [<code>Device</code>](#Device)
Bulb Device.

TP-Link models: LB100, LB110, LB120, LB130.

**Kind**: global class  
**Extends**: [<code>Device</code>](#Device), <code>EventEmitter</code>  
**Emits**: [<code>lightstate-on</code>](#Bulb+event_lightstate-on), [<code>lightstate-off</code>](#Bulb+event_lightstate-off), [<code>lightstate-change</code>](#Bulb+event_lightstate-change), [<code>lightstate-update</code>](#Bulb+event_lightstate-update), [<code>emeter-realtime-update</code>](#Bulb+event_emeter-realtime-update)  

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
    * [.send(payload, [sendOptions])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [sendOptions])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
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

<a name="new_Bulb_new"></a>

### new Bulb(options)
Created by [Client](#Client) - Do not instantiate directly.

See [Device#constructor](Device#constructor) for common options.


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

Requests `cloud.get_info`.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+bind"></a>

#### cloud.bind(username, password, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add device to TP-Link cloud.

Sends `cloud.bind` command.

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

Sends `cloud.unbind` command.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+getFirmwareList"></a>

#### cloud.getFirmwareList([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get device's TP-Link cloud firmware list.

Sends `cloud.get_intl_fw_list` command.

**Kind**: instance method of [<code>cloud</code>](#Bulb+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+cloud+setServerUrl"></a>

#### cloud.setServerUrl(server, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets device's TP-Link cloud server URL.

Sends `cloud.set_server_url` command.

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

Requests `emeter.get_realtime`. Older devices return `current`, `voltage`,... while newer devices return `current_ma`, `voltage_mv`...
This will return a normalized response including both old and new style properies for backwards compatibility.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+emeter+getDayStats"></a>

#### emeter.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Emeter Statisics.

Sends `emeter.get_daystat` command.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+emeter+getMonthStats"></a>

#### emeter.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Emeter Statisics.

Sends `emeter.get_monthstat` command.

**Kind**: instance method of [<code>emeter</code>](#Bulb+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+emeter+eraseStats"></a>

#### emeter.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Emeter Statistics.

Sends `emeter.erase_runtime_stat` command.

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

Requests `schedule.get_next_action`.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getRules"></a>

#### schedule.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getRule"></a>

#### schedule.getRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rule.

Requests `schedule.get_rules` and return rule matching Id

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

Sends `schedule.delete_all_rules` command.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+deleteRule"></a>

#### schedule.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Schedule Rule.

Sends `schedule.delete_rule` command.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+setOverallEnable"></a>

#### schedule.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Schedule Rules.

Sends `schedule.set_overall_enable` command.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getDayStats"></a>

#### schedule.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Usage Statisics.

Sends `schedule.get_daystat` command.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+getMonthStats"></a>

#### schedule.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Usage Statisics.

Sends `schedule.get_monthstat` command.

**Kind**: instance method of [<code>schedule</code>](#Bulb+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+schedule+eraseStats"></a>

#### schedule.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Usage Statistics.

Sends `schedule.erase_runtime_stat` command.

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

Requests `timesetting.get_time`.

**Kind**: instance method of [<code>time</code>](#Bulb+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Bulb+time+getTimezone"></a>

#### time.getTimezone([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`.

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
<a name="Device+deviceId"></a>

### bulb.deviceId ⇒ <code>string</code>
Cached value of `sys_info.deviceId`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+description"></a>

### bulb.description ⇒ <code>string</code>
Cached value of `sys_info.[description|dev_name]`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+model"></a>

### bulb.model ⇒ <code>string</code>
Cached value of `sys_info.model`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+name"></a>

### bulb.name ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+type"></a>

### bulb.type ⇒ <code>string</code>
Cached value of `sys_info.[type|mic_type]`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+deviceType"></a>

### bulb.deviceType ⇒ <code>string</code>
Type of device (or `device` if unknown).

Based on cached value of `sys_info.[type|mic_type]`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>string</code> - 'plub'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### bulb.softwareVersion ⇒ <code>string</code>
Cached value of `sys_info.sw_ver`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+hardwareVersion"></a>

### bulb.hardwareVersion ⇒ <code>string</code>
Cached value of `sys_info.hw_ver`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+mac"></a>

### bulb.mac ⇒ <code>string</code>
Cached value of `sys_info.[mac|mic_mac|ethernet_mac]`.

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
<a name="Device+macNormalized"></a>

### bulb.macNormalized ⇒ <code>string</code>
Normalized cached value of `sys_info.[mac|mic_mac|ethernet_mac]`

Removes all non alphanumeric characters and makes uppercase
`aa:bb:cc:00:11:22` will be normalized to `AABBCC001122`

**Kind**: instance property of [<code>Bulb</code>](#Bulb)  
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

<a name="Device+send"></a>

### bulb.send(payload, [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+sendCommand"></a>

### bulb.sendCommand(command, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for command.\
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
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

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

### bulb.getSysInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setAlias"></a>

### bulb.setAlias(alias, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setLocation"></a>

### bulb.setLocation(latitude, longitude, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set device's location.

Sends `system.set_dev_location` command.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| latitude | <code>number</code> | 
| longitude | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+getModel"></a>

### bulb.getModel([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reboot"></a>

### bulb.reboot(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reboot device.

Sends `system.reboot` command.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reset"></a>

### bulb.reset(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reset device.

Sends `system.reset` command.

**Kind**: instance method of [<code>Bulb</code>](#Bulb)  
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

<a name="Lighting"></a>

## Lighting
Lighting

**Kind**: global class  

* [Lighting](#Lighting)
    * [.lightState](#Lighting+lightState) ⇒ <code>Object</code>
    * [.getLightState([sendOptions])](#Lighting+getLightState) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setLightState(options, [sendOptions])](#Lighting+setLightState) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>

<a name="Lighting+lightState"></a>

### lighting.lightState ⇒ <code>Object</code>
Returns cached results from last retrieval of `lightingservice.get_light_state`.

**Kind**: instance property of [<code>Lighting</code>](#Lighting)  
<a name="Lighting+getLightState"></a>

### lighting.getLightState([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Bulb light state.

Requests `lightingservice.get_light_state`.

**Kind**: instance method of [<code>Lighting</code>](#Lighting)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Lighting+setLightState"></a>

### lighting.setLightState(options, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Sets Bulb light state (on/off, brightness, color, etc).

Sends `lightingservice.transition_light_state` command.

**Kind**: instance method of [<code>Lighting</code>](#Lighting)  

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

<a name="BulbSchedule"></a>

## BulbSchedule
BulbSchedule

**Kind**: global class  

* [BulbSchedule](#BulbSchedule)
    * [.addRule(options, [sendOptions])](#BulbSchedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule([sendOptions])](#BulbSchedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="BulbSchedule+addRule"></a>

### bulbSchedule.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Schedule rule.

Sends `schedule.add_rule` command and returns rule id.

**Kind**: instance method of [<code>BulbSchedule</code>](#BulbSchedule)  
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

<a name="BulbSchedule+editRule"></a>

### bulbSchedule.editRule([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Schedule rule.

Sends `schedule.edit_rule` command and returns rule id.

**Kind**: instance method of [<code>BulbSchedule</code>](#BulbSchedule)  
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

<a name="Client"></a>

## Client ⇐ <code>EventEmitter</code>
Client that sends commands to specified devices or discover devices on the local subnet.
- Contains factory methods to create devices.
- Events are emitted after [#startDiscovery](#startDiscovery) is called.

**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

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

<a name="new_Client_new"></a>

### new Client(options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| [options.defaultSendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |
| [options.defaultSendOptions.timeout] | <code>Number</code> | <code>5000</code> | (ms) |
| [options.defaultSendOptions.transport] | <code>string</code> | <code>&quot;tcp&quot;</code> | 'tcp' or 'udp' |
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

See [Device#constructor](Device#constructor) and [Bulb#constructor](Bulb#constructor) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Bulb#constructor](Bulb#constructor) |

<a name="Client+getPlug"></a>

### client.getPlug(deviceOptions) ⇒ [<code>Plug</code>](#Plug)
Creates [Plug](#Plug) object.

See [Device#constructor](Device#constructor) and [Plug#constructor](Plug#constructor) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Plug#constructor](Plug#constructor) |

<a name="Client+getDevice"></a>

### client.getDevice(deviceOptions, [sendOptions]) ⇒ <code>Promise.&lt;(Plug\|Bulb), Error&gt;</code>
Creates a [Plug](#Plug) or [Bulb](#Bulb) after querying device to determine type.

See [Device#constructor](Device#constructor), [Bulb#constructor](Bulb#constructor), [Plug#constructor](Plug#constructor) for valid options.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Device#constructor](Device#constructor) |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Client+getCommonDevice"></a>

### client.getCommonDevice(deviceOptions) ⇒ [<code>Device</code>](#Device)
Create [Device](#Device) object.
- Device object only supports common Device methods.
- See [Device#constructor](Device#constructor) for valid options.
- Instead use [#getDevice](#getDevice) to create a fully featured object.

**Kind**: instance method of [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| deviceOptions | <code>Object</code> | passed to [Device#constructor](Device#constructor) |

<a name="Client+getDeviceFromSysInfo"></a>

### client.getDeviceFromSysInfo(sysInfo, deviceOptions) ⇒ [<code>Plug</code>](#Plug) \| [<code>Bulb</code>](#Bulb)
Creates device corresponding to the provided `sysInfo`.

See [Device#constructor](Device#constructor), [Bulb#constructor](Bulb#constructor), [Plug#constructor](Plug#constructor) for valid options

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
| [options.broadcast] | <code>string</code> | <code>&quot;255.255.255.255&quot;</code> | broadcast address |
| [options.discoveryInterval] | <code>number</code> | <code>10000</code> | (ms) |
| [options.discoveryTimeout] | <code>number</code> | <code>0</code> | (ms) |
| [options.offlineTolerance] | <code>number</code> | <code>3</code> | # of consecutive missed replies to consider offline |
| [options.deviceTypes] | <code>Array.&lt;string&gt;</code> |  | 'plug','bulb' |
| [options.macAddresses] | <code>Array.&lt;string&gt;</code> |  | MAC will be normalized, comparison will be done after removing special characters (`:`,`-`, etc.) and case insensitive |
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
    * [.alias](#Device+alias) ⇒ <code>string</code>
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
    * [.send(payload, [sendOptions])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [sendOptions])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.startPolling(interval)](#Device+startPolling) ⇒ [<code>Device</code>](#Device) \| [<code>Bulb</code>](#Bulb) \| [<code>Plug</code>](#Plug)
    * [.stopPolling()](#Device+stopPolling)
    * [.getSysInfo([sendOptions])](#Device+getSysInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setAlias(alias, [sendOptions])](#Device+setAlias) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
    * [.setLocation(latitude, longitude, [sendOptions])](#Device+setLocation) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getModel([sendOptions])](#Device+getModel) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.reboot(delay, [sendOptions])](#Device+reboot) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.reset(delay, [sendOptions])](#Device+reset) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="new_Device_new"></a>

### new Device(options)
Created by [getCommonDevice](#Client+getCommonDevice) - Do not instantiate directly


| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| options.client | [<code>Client</code>](#Client) |  | 
| options.sysInfo | <code>Object</code> |  | 
| options.host | <code>string</code> |  | 
| [options.port] | <code>number</code> | <code>9999</code> | 
| [options.logger] | <code>Object</code> |  | 
| [options.defaultSendOptions] | [<code>SendOptions</code>](#SendOptions) |  | 

<a name="Device+sysInfo"></a>

### device.sysInfo ⇒ <code>Object</code>
Returns cached results from last retrieval of `system.sys_info`.

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>Object</code> - system.sys_info  
<a name="Device+alias"></a>

### device.alias ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+deviceId"></a>

### device.deviceId ⇒ <code>string</code>
Cached value of `sys_info.deviceId`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+description"></a>

### device.description ⇒ <code>string</code>
Cached value of `sys_info.[description|dev_name]`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+model"></a>

### device.model ⇒ <code>string</code>
Cached value of `sys_info.model`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+name"></a>

### device.name ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+type"></a>

### device.type ⇒ <code>string</code>
Cached value of `sys_info.[type|mic_type]`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+deviceType"></a>

### device.deviceType ⇒ <code>string</code>
Type of device (or `device` if unknown).

Based on cached value of `sys_info.[type|mic_type]`

**Kind**: instance property of [<code>Device</code>](#Device)  
**Returns**: <code>string</code> - 'plub'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### device.softwareVersion ⇒ <code>string</code>
Cached value of `sys_info.sw_ver`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+hardwareVersion"></a>

### device.hardwareVersion ⇒ <code>string</code>
Cached value of `sys_info.hw_ver`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+mac"></a>

### device.mac ⇒ <code>string</code>
Cached value of `sys_info.[mac|mic_mac|ethernet_mac]`.

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+macNormalized"></a>

### device.macNormalized ⇒ <code>string</code>
Normalized cached value of `sys_info.[mac|mic_mac|ethernet_mac]`

Removes all non alphanumeric characters and makes uppercase
`aa:bb:cc:00:11:22` will be normalized to `AABBCC001122`

**Kind**: instance property of [<code>Device</code>](#Device)  
<a name="Device+send"></a>

### device.send(payload, [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+sendCommand"></a>

### device.sendCommand(command, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for command.\
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
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

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

### device.getSysInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setAlias"></a>

### device.setAlias(alias, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command.

**Kind**: instance method of [<code>Device</code>](#Device)  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setLocation"></a>

### device.setLocation(latitude, longitude, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set device's location.

Sends `system.set_dev_location` command.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| latitude | <code>number</code> | 
| longitude | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+getModel"></a>

### device.getModel([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reboot"></a>

### device.reboot(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reboot device.

Sends `system.reboot` command.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reset"></a>

### device.reset(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reset device.

Sends `system.reset` command.

**Kind**: instance method of [<code>Device</code>](#Device)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Netif"></a>

## Netif
Netif

**Kind**: global class  
<a name="Netif+getScanInfo"></a>

### netif.getScanInfo([refresh], [timeoutInSeconds], [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Requests `netif.get_scaninfo` (list of WiFi networks).

Note that `timeoutInSeconds` is sent in the request and is not the actual network timeout.
The network timeout for the request is calculated by adding the
default network timeout to `timeoutInSeconds`.

**Kind**: instance method of [<code>Netif</code>](#Netif)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [refresh] | <code>Boolean</code> | <code>false</code> | request device's cached results |
| [timeoutInSeconds] | <code>number</code> | <code>10</code> | timeout for scan in seconds |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Away"></a>

## Away
Away

**Kind**: global class  

* [Away](#Away)
    * [.getRules([sendOptions])](#Away+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRule(id, [sendOptions])](#Away+getRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Away+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#Away+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Away+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteRule(id, [sendOptions])](#Away+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setOverallEnable(enable, [sendOptions])](#Away+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Away+getRules"></a>

### away.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Away Rules.

Requests `anti_theft.get_rules`.

**Kind**: instance method of [<code>Away</code>](#Away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Away+getRule"></a>

### away.getRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Away Rule.

Requests `anti_theft.get_rules` and return rule matching Id

**Kind**: instance method of [<code>Away</code>](#Away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response of rule  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Away+addRule"></a>

### away.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Away Rule.

Sends `anti_theft.add_rule` command and returns rule id.

**Kind**: instance method of [<code>Away</code>](#Away)  
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

<a name="Away+editRule"></a>

### away.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Away rule.

Sends `anti_theft.edit_rule` command and returns rule id.

**Kind**: instance method of [<code>Away</code>](#Away)  
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

<a name="Away+deleteAllRules"></a>

### away.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes All Away Rules.

Sends `anti_theft.delete_all_rules` command.

**Kind**: instance method of [<code>Away</code>](#Away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Away+deleteRule"></a>

### away.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Away Rule.

Sends `anti_theft.delete_rule` command.

**Kind**: instance method of [<code>Away</code>](#Away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Away+setOverallEnable"></a>

### away.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Away Rules.

Sends `anti_theft.set_overall_enable` command.

**Kind**: instance method of [<code>Away</code>](#Away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

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
        * [.getRules([sendOptions])](#Plug+timer+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.addRule(options, [sendOptions])](#Plug+timer+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.editRule(options, [sendOptions])](#Plug+timer+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
        * [.deleteAllRules([sendOptions])](#Plug+timer+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.sysInfo](#Plug+sysInfo) ⇒ <code>Object</code>
    * [.inUse](#Plug+inUse) ⇒ <code>boolean</code>
    * [.relayState](#Plug+relayState) ⇒ <code>boolean</code>
    * [.alias](#Device+alias) ⇒ <code>string</code>
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
    * [.send(payload, [sendOptions])](#Device+send) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * [.sendCommand(command, [sendOptions])](#Device+sendCommand) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
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

<a name="new_Plug_new"></a>

### new Plug(options)
Created by [Client](#Client) - Do not instantiate directly.

See [Device#constructor](Device#constructor) for common options.


| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| [options.inUseThreshold] | <code>Number</code> | <code>0</code> | 

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

Requests `anti_theft.get_rules`.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+away+addRule"></a>

#### away.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Away Rule.

Sends `anti_theft.add_rule` command and returns rule id.

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

Sends `anti_theft.edit_rule` command and returns rule id.

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

Sends `anti_theft.delete_all_rules` command.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+away+deleteRule"></a>

#### away.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Away Rule.

Sends `anti_theft.delete_rule` command.

**Kind**: instance method of [<code>away</code>](#Plug+away)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+away+setOverallEnable"></a>

#### away.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Away Rules.

Sends `anti_theft.set_overall_enable` command.

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

Requests `cloud.get_info`.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+bind"></a>

#### cloud.bind(username, password, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add device to TP-Link cloud.

Sends `cloud.bind` command.

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

Sends `cloud.unbind` command.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+getFirmwareList"></a>

#### cloud.getFirmwareList([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get device's TP-Link cloud firmware list.

Sends `cloud.get_intl_fw_list` command.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+cloud+setServerUrl"></a>

#### cloud.setServerUrl(server, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets device's TP-Link cloud server URL.

Sends `cloud.set_server_url` command.

**Kind**: instance method of [<code>cloud</code>](#Plug+cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | URL |
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

Requests `emeter.get_realtime`. Older devices return `current`, `voltage`,... while newer devices return `current_ma`, `voltage_mv`...
This will return a normalized response including both old and new style properies for backwards compatibility.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+emeter+getDayStats"></a>

#### emeter.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Emeter Statisics.

Sends `emeter.get_daystat` command.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+emeter+getMonthStats"></a>

#### emeter.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Emeter Statisics.

Sends `emeter.get_monthstat` command.

**Kind**: instance method of [<code>emeter</code>](#Plug+emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+emeter+eraseStats"></a>

#### emeter.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Emeter Statistics.

Sends `emeter.erase_runtime_stat` command.

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

Requests `schedule.get_next_action`.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getRules"></a>

#### schedule.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getRule"></a>

#### schedule.getRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rule.

Requests `schedule.get_rules` and return rule matching Id

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response of rule  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+addRule"></a>

#### schedule.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Schedule rule.

Sends `schedule.add_rule` command and returns rule id.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.powerState | <code>boolean</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  |  |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+schedule+editRule"></a>

#### schedule.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Schedule rule.

Sends `schedule.edit_rule` command and returns rule id.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.id | <code>string</code> |  |  |
| options.powerState | <code>boolean</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  | [description] |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Plug+schedule+deleteAllRules"></a>

#### schedule.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes All Schedule Rules.

Sends `schedule.delete_all_rules` command.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+deleteRule"></a>

#### schedule.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Schedule Rule.

Sends `schedule.delete_rule` command.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+setOverallEnable"></a>

#### schedule.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Schedule Rules.

Sends `schedule.set_overall_enable` command.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getDayStats"></a>

#### schedule.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Usage Statisics.

Sends `schedule.get_daystat` command.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+getMonthStats"></a>

#### schedule.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Usage Statisics.

Sends `schedule.get_monthstat` command.

**Kind**: instance method of [<code>schedule</code>](#Plug+schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+schedule+eraseStats"></a>

#### schedule.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Usage Statistics.

Sends `schedule.erase_runtime_stat` command.

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

Requests `timesetting.get_time`.

**Kind**: instance method of [<code>time</code>](#Plug+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+time+getTimezone"></a>

#### time.getTimezone([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`.

**Kind**: instance method of [<code>time</code>](#Plug+time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+timer"></a>

### plug.timer
**Kind**: instance property of [<code>Plug</code>](#Plug)  

* [.timer](#Plug+timer)
    * [.getRules([sendOptions])](#Plug+timer+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Plug+timer+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#Plug+timer+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Plug+timer+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Plug+timer+getRules"></a>

#### timer.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Countdown Timer Rule (only one allowed).

Requests `count_down.get_rules`.

**Kind**: instance method of [<code>timer</code>](#Plug+timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+timer+addRule"></a>

#### timer.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add Countdown Timer Rule (only one allowed).

Sends count_down.add_rule command.

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

Sends count_down.edit_rule command.

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

Sends count_down.delete_all_rules command.

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
<a name="Plug+inUse"></a>

### plug.inUse ⇒ <code>boolean</code>
Determines if device is in use based on cached `emeter.get_realtime` results.

If device supports energy monitoring (HS110): `power > inUseThreshold`

Otherwise fallback on relay state:  `relay_state === 1`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Plug+relayState"></a>

### plug.relayState ⇒ <code>boolean</code>
`sys_info.relay_state === 1`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+alias"></a>

### plug.alias ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+deviceId"></a>

### plug.deviceId ⇒ <code>string</code>
Cached value of `sys_info.deviceId`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+description"></a>

### plug.description ⇒ <code>string</code>
Cached value of `sys_info.[description|dev_name]`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+model"></a>

### plug.model ⇒ <code>string</code>
Cached value of `sys_info.model`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+name"></a>

### plug.name ⇒ <code>string</code>
Cached value of `sys_info.alias`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+type"></a>

### plug.type ⇒ <code>string</code>
Cached value of `sys_info.[type|mic_type]`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+deviceType"></a>

### plug.deviceType ⇒ <code>string</code>
Type of device (or `device` if unknown).

Based on cached value of `sys_info.[type|mic_type]`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
**Returns**: <code>string</code> - 'plub'|'bulb'|'device'  
<a name="Device+softwareVersion"></a>

### plug.softwareVersion ⇒ <code>string</code>
Cached value of `sys_info.sw_ver`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+hardwareVersion"></a>

### plug.hardwareVersion ⇒ <code>string</code>
Cached value of `sys_info.hw_ver`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+mac"></a>

### plug.mac ⇒ <code>string</code>
Cached value of `sys_info.[mac|mic_mac|ethernet_mac]`.

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Device+macNormalized"></a>

### plug.macNormalized ⇒ <code>string</code>
Normalized cached value of `sys_info.[mac|mic_mac|ethernet_mac]`

Removes all non alphanumeric characters and makes uppercase
`aa:bb:cc:00:11:22` will be normalized to `AABBCC001122`

**Kind**: instance property of [<code>Plug</code>](#Plug)  
<a name="Plug+getInfo"></a>

### plug.getInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Requests common Plug status details in a single request.
- `system.get_sysinfo`
- `cloud.get_sysinfo`
- `emeter.get_realtime`
- `schedule.get_next_action`

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+getInUse"></a>

### plug.getInUse([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Same as [#inUse](#inUse), but requests current `emeter.get_realtime`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+getLedState"></a>

### plug.getLedState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug LED state (night mode).

Requests `system.sys_info` and returns true if `led_off === 0`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;boolean, ResponseError&gt;</code> - LED State, true === on  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+setLedState"></a>

### plug.setLedState(value, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Turn Plug LED on/off (night mode).

Sends `system.set_led_off` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>boolean</code> | LED State, true === on |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Plug+getPowerState"></a>

### plug.getPowerState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Get Plug relay state (on/off).

Requests `system.get_sysinfo` and returns true if `relay_state === 1`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+setPowerState"></a>

### plug.setPowerState(value, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Turns Plug relay on/off.

Sends `system.set_relay_state` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| value | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+togglePowerState"></a>

### plug.togglePowerState([sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Toggles Plug relay state.

Requests `system.get_sysinfo` sets the power state to the opposite `relay_state === 1 and return the new power state`.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Plug+blink"></a>

### plug.blink([times], [rate], [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Blink Plug LED.

Sends `system.set_led_off` command alternating on and off number of `times` at `rate`,
then sets the led to its pre-blink state.

Note: `system.set_led_off` is particulally slow, so blink rate is not guaranteed.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type | Default |
| --- | --- | --- |
| [times] | <code>number</code> | <code>5</code> | 
| [rate] | <code>number</code> | <code>1000</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  | 

<a name="Device+send"></a>

### plug.send(payload, [sendOptions]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Sends `payload` to device (using [send](#Client+send))

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| payload | <code>Object</code> \| <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+sendCommand"></a>

### plug.sendCommand(command, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sends command(s) to device.

Calls [#send](#send) and processes the response.

- If only one operation was sent:
  - Promise fulfills with specific parsed JSON response for command.\
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
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

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

### plug.getSysInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's SysInfo.

Requests `system.sys_info` from device.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setAlias"></a>

### plug.setAlias(alias, [sendOptions]) ⇒ <code>Promise.&lt;boolean, ResponseError&gt;</code>
Change device's alias (name).

Sends `system.set_dev_alias` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  

| Param | Type |
| --- | --- |
| alias | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+setLocation"></a>

### plug.setLocation(latitude, longitude, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Set device's location.

Sends `system.set_dev_location` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| latitude | <code>number</code> | 
| longitude | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+getModel"></a>

### plug.getModel([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's model.

Requests `system.sys_info` and returns model name.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reboot"></a>

### plug.reboot(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reboot device.

Sends `system.reboot` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| delay | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Device+reset"></a>

### plug.reset(delay, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Reset device.

Sends `system.reset` command.

**Kind**: instance method of [<code>Plug</code>](#Plug)  
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

<a name="PlugSchedule"></a>

## PlugSchedule
PlugSchedule

**Kind**: global class  

* [PlugSchedule](#PlugSchedule)
    * [.addRule(options, [sendOptions])](#PlugSchedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#PlugSchedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="PlugSchedule+addRule"></a>

### plugSchedule.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Schedule rule.

Sends `schedule.add_rule` command and returns rule id.

**Kind**: instance method of [<code>PlugSchedule</code>](#PlugSchedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.powerState | <code>boolean</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  |  |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="PlugSchedule+editRule"></a>

### plugSchedule.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Schedule rule.

Sends `schedule.edit_rule` command and returns rule id.

**Kind**: instance method of [<code>PlugSchedule</code>](#PlugSchedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.id | <code>string</code> |  |  |
| options.powerState | <code>boolean</code> |  |  |
| options.start | <code>Date</code> \| <code>number</code> |  | Date or number of minutes |
| [options.daysOfWeek] | <code>Array.&lt;number&gt;</code> |  | [0,6] = weekend, [1,2,3,4,5] = weekdays |
| [options.name] | <code>string</code> |  | [description] |
| [options.enable] | <code>boolean</code> | <code>true</code> |  |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |  |

<a name="Timer"></a>

## Timer
Timer

**Kind**: global class  

* [Timer](#Timer)
    * [.getRules([sendOptions])](#Timer+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(options, [sendOptions])](#Timer+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(options, [sendOptions])](#Timer+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Timer+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Timer+getRules"></a>

### timer.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Countdown Timer Rule (only one allowed).

Requests `count_down.get_rules`.

**Kind**: instance method of [<code>Timer</code>](#Timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Timer+addRule"></a>

### timer.addRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add Countdown Timer Rule (only one allowed).

Sends count_down.add_rule command.

**Kind**: instance method of [<code>Timer</code>](#Timer)  
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

<a name="Timer+editRule"></a>

### timer.editRule(options, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edit Countdown Timer Rule (only one allowed).

Sends count_down.edit_rule command.

**Kind**: instance method of [<code>Timer</code>](#Timer)  
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

<a name="Timer+deleteAllRules"></a>

### timer.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Delete Countdown Timer Rule (only one allowed).

Sends count_down.delete_all_rules command.

**Kind**: instance method of [<code>Timer</code>](#Timer)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Cloud"></a>

## Cloud
Cloud

**Kind**: global class  

* [Cloud](#Cloud)
    * [.getInfo([sendOptions])](#Cloud+getInfo) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.bind(username, password, [sendOptions])](#Cloud+bind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.unbind([sendOptions])](#Cloud+unbind) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getFirmwareList([sendOptions])](#Cloud+getFirmwareList) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setServerUrl(server, [sendOptions])](#Cloud+setServerUrl) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Cloud+getInfo"></a>

### cloud.getInfo([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's TP-Link cloud info.

Requests `cloud.get_info`.

**Kind**: instance method of [<code>Cloud</code>](#Cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Cloud+bind"></a>

### cloud.bind(username, password, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Add device to TP-Link cloud.

Sends `cloud.bind` command.

**Kind**: instance method of [<code>Cloud</code>](#Cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| username | <code>string</code> | 
| password | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Cloud+unbind"></a>

### cloud.unbind([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Remove device from TP-Link cloud.

Sends `cloud.unbind` command.

**Kind**: instance method of [<code>Cloud</code>](#Cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Cloud+getFirmwareList"></a>

### cloud.getFirmwareList([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get device's TP-Link cloud firmware list.

Sends `cloud.get_intl_fw_list` command.

**Kind**: instance method of [<code>Cloud</code>](#Cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Cloud+setServerUrl"></a>

### cloud.setServerUrl(server, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Sets device's TP-Link cloud server URL.

Sends `cloud.set_server_url` command.

**Kind**: instance method of [<code>Cloud</code>](#Cloud)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>string</code> | URL |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) |  |

<a name="Emeter"></a>

## Emeter
Eemter

**Kind**: global class  

* [Emeter](#Emeter)
    * [.realtime](#Emeter+realtime) ⇒ <code>Object</code>
    * [.getRealtime([sendOptions])](#Emeter+getRealtime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDayStats(year, month, [sendOptions])](#Emeter+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getMonthStats(year, [sendOptions])](#Emeter+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.eraseStats([sendOptions])](#Emeter+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Emeter+realtime"></a>

### emeter.realtime ⇒ <code>Object</code>
Returns cached results from last retrieval of `emeter.get_realtime`.

**Kind**: instance property of [<code>Emeter</code>](#Emeter)  
<a name="Emeter+getRealtime"></a>

### emeter.getRealtime([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's current energy stats.

Requests `emeter.get_realtime`. Older devices return `current`, `voltage`,... while newer devices return `current_ma`, `voltage_mv`...
This will return a normalized response including both old and new style properies for backwards compatibility.

**Kind**: instance method of [<code>Emeter</code>](#Emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Emeter+getDayStats"></a>

### emeter.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Emeter Statisics.

Sends `emeter.get_daystat` command.

**Kind**: instance method of [<code>Emeter</code>](#Emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Emeter+getMonthStats"></a>

### emeter.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Emeter Statisics.

Sends `emeter.get_monthstat` command.

**Kind**: instance method of [<code>Emeter</code>](#Emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Emeter+eraseStats"></a>

### emeter.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Emeter Statistics.

Sends `emeter.erase_runtime_stat` command.

**Kind**: instance method of [<code>Emeter</code>](#Emeter)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule"></a>

## Schedule
Schedule

**Kind**: global class  

* [Schedule](#Schedule)
    * [.getNextAction([sendOptions])](#Schedule+getNextAction) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRules([sendOptions])](#Schedule+getRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getRule(id, [sendOptions])](#Schedule+getRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.addRule(rule, [sendOptions])](#Schedule+addRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.editRule(rule, [sendOptions])](#Schedule+editRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteAllRules([sendOptions])](#Schedule+deleteAllRules) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.deleteRule(id, [sendOptions])](#Schedule+deleteRule) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.setOverallEnable(enable, [sendOptions])](#Schedule+setOverallEnable) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getDayStats(year, month, [sendOptions])](#Schedule+getDayStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getMonthStats(year, [sendOptions])](#Schedule+getMonthStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.eraseStats([sendOptions])](#Schedule+eraseStats) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Schedule+getNextAction"></a>

### schedule.getNextAction([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Next Schedule Rule Action.

Requests `schedule.get_next_action`.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+getRules"></a>

### schedule.getRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rules.

Requests `schedule.get_rules`.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+getRule"></a>

### schedule.getRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets Schedule Rule.

Requests `schedule.get_rules` and return rule matching Id

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response of rule  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+addRule"></a>

### schedule.addRule(rule, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Adds Schedule rule.

Sends `schedule.add_rule` command and returns rule id.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| rule | <code>Object</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+editRule"></a>

### schedule.editRule(rule, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Edits Schedule Rule.

Sends `schedule.edit_rule` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| rule | <code>Object</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+deleteAllRules"></a>

### schedule.deleteAllRules([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes All Schedule Rules.

Sends `schedule.delete_all_rules` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+deleteRule"></a>

### schedule.deleteRule(id, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Deletes Schedule Rule.

Sends `schedule.delete_rule` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| id | <code>string</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+setOverallEnable"></a>

### schedule.setOverallEnable(enable, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Enables or Disables Schedule Rules.

Sends `schedule.set_overall_enable` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| enable | <code>boolean</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+getDayStats"></a>

### schedule.getDayStats(year, month, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Daily Usage Statisics.

Sends `schedule.get_daystat` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| month | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+getMonthStats"></a>

### schedule.getMonthStats(year, [sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Get Monthly Usage Statisics.

Sends `schedule.get_monthstat` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| year | <code>number</code> | 
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Schedule+eraseStats"></a>

### schedule.eraseStats([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Erase Usage Statistics.

Sends `schedule.erase_runtime_stat` command.

**Kind**: instance method of [<code>Schedule</code>](#Schedule)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Time"></a>

## Time
Time

**Kind**: global class  

* [Time](#Time)
    * [.getTime([sendOptions])](#Time+getTime) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
    * [.getTimezone([sendOptions])](#Time+getTimezone) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>

<a name="Time+getTime"></a>

### time.getTime([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's time.

Requests `timesetting.get_time`.

**Kind**: instance method of [<code>Time</code>](#Time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="Time+getTimezone"></a>

### time.getTimezone([sendOptions]) ⇒ <code>Promise.&lt;Object, ResponseError&gt;</code>
Gets device's timezone.

Requests `timesetting.get_timezone`.

**Kind**: instance method of [<code>Time</code>](#Time)  
**Returns**: <code>Promise.&lt;Object, ResponseError&gt;</code> - parsed JSON response  

| Param | Type |
| --- | --- |
| [sendOptions] | [<code>SendOptions</code>](#SendOptions) | 

<a name="ResponseError"></a>

## ResponseError ⇐ <code>Error</code>
Represents an error result received from a TP-Link device.

Where response err_code != 0.

**Kind**: global class  
**Extends**: <code>Error</code>  
<a name="SendOptions"></a>

## SendOptions : <code>Object</code>
Send Options.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| timeout | <code>number</code> | (ms) |
| transport | <code>string</code> | 'tcp','udp' |

