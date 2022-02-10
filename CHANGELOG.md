# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.7.0] - 2022-02-10
### Added
- Add support for the Shelly TRV.

## [1.6.0] - 2021-08-08
### Fixed
- **[Potentially breaking]** Change the data type of several device properties
  from `Boolean` to `Number` since their possible values have changed from 0/1
  to 0/1/-1, where -1 usually indicates that there is no valid reading.
- Update dependencies to fix security vulnerabilities.

## [1.5.0] - 2021-02-28
### Added
- Add support for unicast UDP messages.

## [1.4.0] - 2021-02-23
### Added
- Add support for the Shelly Motion (thanks to @jghaanstra).

## [1.3.0] - 2021-01-12
### Added
- Add support for the Shelly Button1 version 2.

## [1.2.0] - 2021-01-11
### Added
- Add support for the Shelly Bulb RGBW (thanks to @jghaanstra).

## [1.1.1] - 2020-11-26
### Fixed
- Fixed a bug with duplicate properties on the Shelly 1L.

## [1.1.0] - 2020-11-26
### Added
- Add support for the Shelly 1L and the Shelly Uni (thanks to @jghaanstra).

### Changed
- Update the coap library to version 0.24.0.

## [1.0.2] - 2020-09-04
### Fixed
- Add a missing `setRelay()` method to `ShellyAir`.

## [1.0.1] - 2020-08-15
### Changed
- **[Breaking]** Rename the `externalTemperature` property of `ShellyFlood` to
  `temperature`.

### Fixed
- Add a missing `mode` argument to the `Shelly25` constructor.

[Unreleased]: https://github.com/alexryd/node-shellies/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/alexryd/node-shellies/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/alexryd/node-shellies/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/alexryd/node-shellies/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/alexryd/node-shellies/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/alexryd/node-shellies/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/alexryd/node-shellies/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/alexryd/node-shellies/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/alexryd/node-shellies/compare/v1.0.2...v1.1.0
[1.0.2]: https://github.com/alexryd/node-shellies/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/alexryd/node-shellies/compare/v1.0.0...v1.0.1
