# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/plasticrake/tplink-smarthome-api/compare/v4.0.0...v4.1.0) (2022-02-03)


### Features

* **Bulb:** add lightstate-sysinfo events ([6b844a1](https://github.com/plasticrake/tplink-smarthome-api/commit/6b844a178806fc794bc8e04e9d8f3ab1c95d6a5e))

## [4.0.0](https://github.com/plasticrake/tplink-smarthome-api/compare/v3.3.0...v4.0.0) (2022-02-02)


### ⚠ BREAKING CHANGES

* **Bulb:** removed previously deprecated
`getColorTemperatureRange`. Use `colorTemperatureRange` instead.
* apiModules is now non-static property
* require minimum node version v12.20.0

### Features

* **Bulb:** removed deprecated getColorTemperatureRange ([3dd442b](https://github.com/plasticrake/tplink-smarthome-api/commit/3dd442b25decfb03656dc9054231ec1c26c8a8a3))
* add color temp ranges for additional models ([#137](https://github.com/plasticrake/tplink-smarthome-api/issues/137)) ([48eb046](https://github.com/plasticrake/tplink-smarthome-api/commit/48eb046bc9600fa2ec0c857884e5b24b70d3698a))
* **Plug:** add support for light strips such as KL430 ([874a431](https://github.com/plasticrake/tplink-smarthome-api/commit/874a4314460d90af133daccab2e12c7a10de1a95)), closes [#130](https://github.com/plasticrake/tplink-smarthome-api/issues/130) [#90](https://github.com/plasticrake/tplink-smarthome-api/issues/90)
* change static property apiModules to non-static ([6a171aa](https://github.com/plasticrake/tplink-smarthome-api/commit/6a171aa4f4f7fb3afdb9697ecc4fca11b6dc617b))
* **Bulb:** add getLightDetails ([#135](https://github.com/plasticrake/tplink-smarthome-api/issues/135)) ([705392f](https://github.com/plasticrake/tplink-smarthome-api/commit/705392fc65ce0a091f0497974d3dfe7567dec26f)), closes [#92](https://github.com/plasticrake/tplink-smarthome-api/issues/92)


### Bug Fixes

* cli `TypeError: Found non-callable @[@iterator](https://github.com/iterator)` ([#125](https://github.com/plasticrake/tplink-smarthome-api/issues/125)) ([3e53050](https://github.com/plasticrake/tplink-smarthome-api/commit/3e5305042d5e8d0297ea94a775bbbc65c692ea0b)), closes [#124](https://github.com/plasticrake/tplink-smarthome-api/issues/124)
* dimmer.setGentle*Time incorrectly named parameter ([db9993f](https://github.com/plasticrake/tplink-smarthome-api/commit/db9993f904bc39c612290c8301c41b5f53aa5772)), closes [#129](https://github.com/plasticrake/tplink-smarthome-api/issues/129)
* keep socket timer going until close emitted ([416ce38](https://github.com/plasticrake/tplink-smarthome-api/commit/416ce387f28036029a6db73c86b97ba7383c0ebf)), closes [#108](https://github.com/plasticrake/tplink-smarthome-api/issues/108)


* upgrade commander ([1911aa4](https://github.com/plasticrake/tplink-smarthome-api/commit/1911aa4d033fbe91671f7dc6491bdaa759373e64))

## [3.3.0](https://github.com/plasticrake/tplink-smarthome-api/compare/v3.2.1...v3.3.0) (2021-03-01)


### Features

* change emeter#realtime type to RealtimeNormalized ([1645215](https://github.com/plasticrake/tplink-smarthome-api/commit/1645215c4aa44a2b82752969401741c631044ff5))
* **Plug:** add dimmer.brightness property ([47f28f7](https://github.com/plasticrake/tplink-smarthome-api/commit/47f28f7e403dd993e0a98e8083f863e67ff04618))
* **Plug:** emit brightness-change & brightness-update ([3fb2897](https://github.com/plasticrake/tplink-smarthome-api/commit/3fb289710f616f88809a7e2c9c6d4f3911d322d5))


### Bug Fixes

* mark startPolling as deprecated ([cc658ec](https://github.com/plasticrake/tplink-smarthome-api/commit/cc658ecb3fc48993d726efbee2b5aa9cc337817d))

### [3.2.1](https://github.com/plasticrake/tplink-smarthome-api/compare/v3.2.0...v3.2.1) (2021-02-28)


### Bug Fixes

* rename `getColorTemperatureRange` to `colorTemperatureRange` ([e3664d2](https://github.com/plasticrake/tplink-smarthome-api/commit/e3664d28867ad08801bf6eecf638ae5f4c6f4dac))

## [3.2.0](https://github.com/plasticrake/tplink-smarthome-api/compare/v3.1.0...v3.2.0) (2021-02-28)


### Features

* add EventEmitter types ([db259e9](https://github.com/plasticrake/tplink-smarthome-api/commit/db259e906455f7c9eb749350b8cb81163682e9ca))
* export types Realtime, RealtimeV1, RealtimeV2 ([f5f020f](https://github.com/plasticrake/tplink-smarthome-api/commit/f5f020f7f7ef2f111a74be5a236db26b2419c906))
* use standard-version ([#121](https://github.com/plasticrake/tplink-smarthome-api/issues/121)) ([e3a6cca](https://github.com/plasticrake/tplink-smarthome-api/commit/e3a6cca5d31a0f50df05a3ea82cd9463b9c1cfea))


### Bug Fixes

* **cli:** remove non-functional -c parameter for sendCommand ([c3bfe0e](https://github.com/plasticrake/tplink-smarthome-api/commit/c3bfe0ece3995d82c7655ad86e27a36eec8f48c6)), closes [#94](https://github.com/plasticrake/tplink-smarthome-api/issues/94)

## 3.1.0 / 2020-10-13

### Added :heavy_plus_sign:

- CLI: add `--broadcast` option to `search` command

## 3.0.0 / 2020-10-13

### Added :heavy_plus_sign:

- Export types: `BulbSysinfo`, `PlugSysinfo`, `PlugConstructorOptions`

## 3.0.0-beta.1 / 2020-10-10

### Breaking Changes :boom:

- `Bulb`/`Plug`
  - `#getInfo` now defaults to TCP transport unless specifically overridden in the call to `#getInfo`.
    - Some newer devices and firmware would crash and reset when sent `emeter:{get_realtime:{}}` over UDP.

## 3.0.0-beta.0 / 2020-08-26

### Breaking Changes :boom:

- `Client`
  - `#startDiscovery` no longer queries energy usage (`emeter:{get_realtime:{}}`)
    - Some newer devices and firmware would crash and reset when sent `emeter:{get_realtime:{}}`

## 3.0.0-beta / 2020-06-28

### Breaking Changes :boom:

- `Client`
  - `#send` returns a string instead of an object
  - removed `#getCommonDevice`
- `Device`
  - Cannot be instantiated directly. Use `Client` or `new Bulb()` or `new Plug()`;
- `Bulb`/`Plug`
  - `sysInfo` is now required to be passed in the constructor.
- `Bulb`
  - `#getColorTemperatureRange` now returns `null` instead of `undefined` when the bulb does not support color temperature.
- `Plug`
  - `#relayState` changed to better reflect state of plugs with children. If device supports childId, but childId is not set, then it will return true if any child has `state === 1`.
- `ResponseError`
  - properties `response` and `command` are now strings instead of objects.
  - property `errorModules` was renamed to `modules`.

## 2.0.0 / 2020-01-01

### Added :heavy_plus_sign:

- Export `Bulb`, `Device`, `Plug`

### Breaking Changes :boom:

- Drop support for Node.js versions older than v10

## 1.3.0 / 2019-12-14

### Added :heavy_plus_sign:

- `Device`/`Bulb`/`Plug`
  - add `useSharedSocket` and `sharedSocketTimeout` to `sendOptions`
  - add `#closeConnection` function

### Changes :zap:

- `Client`

  - `startDiscovery` now queries emeter realtime information and devices may emit `emeter-realtime-update` if supported

- `Client`/`Device`/`Bulb`/`Plug`

  - rewrote and improved TCP/UDP networking code

- `Device`/`Bulb`/`Plug`
  - change `defaultSendOptions` to default to `Client` `defaultSendOptions`
  - `startPoller` now emits `polling-error` (#60)

## 1.2.0 / 2019-01-18

### Added :heavy_plus_sign:

- `Plug`
  - add `supportsDimmer` property, returns true if dimmable plug (HS220)
  - add `dimmer` functions
    - `dimmer.setBrightness`
    - `dimmer.getDefaultBehavior`
    - `dimmer.getDimmerParameters`
    - `dimmer.setDimmerTransition`
    - `dimmer.setDoubleClickAction`
    - `dimmer.setFadeOffTime`
    - `dimmer.setFadeOnTime`
    - `dimmer.setGentleOffTime`
    - `dimmer.setGentleOnTime`
    - `dimmer.setLongPressAction`
    - `dimmer.setSwitchState`

### Changes :zap:

- `Plug`
  - `schedule`
    - add `dimmer` parameter to `addRule`
    - add `dimmer` parameter to `editRule`

## 1.1.0 / 2019-01-10

### Changes :zap:

- `Client`
  - `excludedMacAddresses` parameter added to `startDiscovery`
  - `filterCallback` parameter added to `startDiscovery`
  - `startDiscovery` parameters `macAddresses` and `excludedMacAddress` now support GLOB style patterns with `?` and `*`

## 1.0.0 / 2019-01-02

### Changes :zap:

- `Device`/`Bulb`/`Plug`
  - `sendCommand`
    - `ResponseError` thrown by `sendCommand` now includes:
      - `command`: command sent to device
      - `errorModules`: array of modules that returned with errors.
  - add `id` property. Returns `deviceId` or `childId` if childId is set.
  - `alias` returns child alias if childId is set
  - `defaultSendOptions.timeout` default changed to 10000 ms from 5000 ms
- `Client`
  - `breakoutChildren` parameter added to `startDiscovery`
  - `defaultSendOptions.timeout` default changed to 10000 ms from 5000 ms

### Fixed :bug:

- `Plug`
  - `constructor`
    - change default `inUseThreshold` from `0` to `0.1`. Even with nothing plugged into some outlets and relay turned off they may report a small power draw.

### Breaking Changes :boom:

- `Device`/`Bulb`/`Plug`
  - `sendCommand`
    - BREAKING CHANGE: Add childId parameter that will add `"context":{child_ids:[]}` to the command. This is to support plugs with multiple outlets.

## 0.23.1 / 2018-12-02

### Fixed :bug:

- Plug#getInfo and Emeter#realtime for devices without energy monitoring (Regression introduced in 0.23.0)

## 0.23.0 / 2018-08-16

### Breaking Changes :boom:

- Requires minimum Node version 6.4

### Changes :zap:

- `Bulb`/`Plug`
  - `getEmeterRealtime` will now simultaneously return both the new and old API style responses, i.e. `current` and `current_ma`.

### Fixed :bug:

- Change `Bulb#getInfo()` to request `system: { get_sysinfo }` instead of `smartlife.iot.common.system: { get_sysInfo }`

## 0.22.0 / 2017-01-05

### Added :heavy_plus_sign:

- `Device#macNormalized`
- Basic automated testing of CLI

## 0.21.0 / 2017-01-02

### Changes :zap:

- Changed TCP response handling to timeout when device responds but does not close connection

### Fixed :bug:

- CLI: Fixed reboot, reset, setLocation commands that expect integer arguments

## 0.20.1 / 2017-10-24

### Fixed :bug:

- Reject instead of incorrectly throwing error for network errors

## 0.20.0 / 2017-10-19

### Changes :zap:

- new name, `hs100-api` is now `tplink-smarthome-api`

## 0.19.0 / 2017-10-18

### Breaking Changes :boom:

- `Device`/`Bulb`/`Plug`
  - Many methods were moved to mirror the TPLink API.
    - Example: `Plug#getScheduleRules()` is now `Plug.schedule#getRules()`
    - Example: `Bulb#getCloudInfo()` is now `Bulb.cloud#getInfo()`
    - See API documentation for details.

### Added :heavy_plus_sign:

- `Device`/`Bulb`/`Plug`
  - Dozens of new methods, see documentation for details.
  - `options` added as last argument to functions that send commands
    - `options.timeout` and `options.transport` can be set to customize the timeout and transport (tcp, udp) used for a single command
  - `defaultSendOptions` added to constructor
- `Client`
  - `send`/`sendCommand`
    - Receiving large TCP responses split across multiple segments are now supported
    - Support UDP in addition to TCP
      - UDP can be unreliable, also large replies may not be sent back from the device
- `ResponseError` now exported so consumer can check errors with `instanceof`

## 0.18.0 / 2017-10-11

### Added :heavy_plus_sign:

- `Plug`
  - `#addTimerRule`
  - `#editTimerRule`
  - `#deleteAllTimerRules`
- `Client#startDiscovery` now emits `discovery-invalid` when receiving an invalid response (perhaps from a non-tplink device)

### Fixed :bug:

- `encrypt` and `encryptWithHeader` now work properly with non-ascii characters

## 0.17.0 / 2017-10-10

### Fixed :bug:

- [plasticrake/homebridge-hs100#35]: Switch to utf8 from ascii to support special characters in Alias (thanks [@wzaatar])

[plasticrake/homebridge-hs100#35]: https://github.com/plasticrake/homebridge-tplink-smarthome/issues/35
[@wzaatar]: https://github.com/wzaatar

## 0.16.0 / 2017-10-09

### Added :heavy_plus_sign:

- `Device#name` re-added as alias for `Device#alias` for backwards compatibility
- `Client.startDiscovery` has additional parameter `macAddresses`
  - if specified only devices matching MAC will be found
- `Bulb`
  - `#supportsBrightness`
  - `#supportsColor`
  - `#supportsColorTemperature`
  - `#getColorTemperatureRange`
  - [#18]`#togglePowerState` (thanks [@adamsandle]!)
- `Plug`
  - [#18]`#togglePowerState` (thanks [@adamsandle]!)

[#18]: https://github.com/plasticrake/tplink-smarthome-api/pulls/18
[@adamsandle]: https://github.com/adamsandle

## 0.15.0 / 2017-10-07

### Breaking Changes :boom:

- `Client#getGeneralDevice` is now `Client#getCommonDevice`
- `Device#name` is now `Device#alias`
- `Device#type` is now `Device#deviceType`
- `Device#getConsumption()` is now `Device#getEmeterRealtime()`
- `supportsConsumption` is now `supportsEmeter`
- `consumption-update` is now `emeter-realtime-update`
- Existing `Device`/`Bulb`/`Plug` events have changed to no longer emit with `this` as argument

### Added :heavy_plus_sign:

- Support for older Node 4.8
- `Bulb#getInfo()` added to mirror `Plug#getInfo()`
- New `Bulb` events: `lightstate-on`, `lightstate-off`, `lightstate-change`, `lightstate-update`

### Changes :zap:

- Updated examples
