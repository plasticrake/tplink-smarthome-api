# 0.16.2 / 2017-10-10

## :bug: Fixes

- [plasticrake/homebridge-hs100#35]: Switch to utf8 from ascii to support special characters in Alias (thanks [@wzaatar])

# 0.16.0 / 2017-10-09

## :tada: Enhancements
- `Device#name` re-added as alias for `Device#alias` for backwards compatibility
- `Client.startDiscovery` has additional parameter `macAddresses`
  - if specified only devices matching MAC will be found
- `Bulb`
  - added `#supportsBrightness`
  - added `#supportsColor`
  - added `#supportsColorTemperature`
  - added `#getColorTemperatureRange`
  - [#14] added `#togglePowerState` (thanks [@adamsandle]!)
- `Plug`
  - [#14] added `#togglePowerState` (thanks [@adamsandle]!)

# 0.15.0 / 2017-10-07

## :boom: Breaking Changes

- `Client#getGeneralDevice` is now `Client#getCommonDevice`
- `Device#name` is now `Device#alias`
- `Device#type` is now `Device#deviceType`
- `Device#getConsumption()` is now `Device#getEmeterRealtime()`
- `supportsConsumption` is now `supportsEmeter`
- `consumption-update` is now `emeter-realtime-update`
-  Existing `Device`/`Bulb`/`Plug` events have changed to no longer emit with `this` as argument

## :tada: Enhancements

- Support for older Node 4.8
- `Bulb#getInfo()` added to mirror `Plug#getInfo()`
- New `Bulb` events: `lightstate-on`, `lightstate-off`, `lightstate-change`, `lightstate-update`

## :nut_and_bolt: Other

- Updated examples
