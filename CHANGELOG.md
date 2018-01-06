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
    - See API documenation for details.

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
- `encrypt` and `encyptWithHeader` now work properly with non-ascii characters

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
-  Existing `Device`/`Bulb`/`Plug` events have changed to no longer emit with `this` as argument

### Added :heavy_plus_sign:

- Support for older Node 4.8
- `Bulb#getInfo()` added to mirror `Plug#getInfo()`
- New `Bulb` events: `lightstate-on`, `lightstate-off`, `lightstate-change`, `lightstate-update`

### Changes :zap:
- Updated examples
