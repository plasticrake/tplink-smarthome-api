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
