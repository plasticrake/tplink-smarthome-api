<!-- markdownlint-disable MD024 MD026 -->

# Change Log

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
