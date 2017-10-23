# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
## [0.4.1]
### Added
- `ArbitraryVoiceResponse`, `BroadcastVoiceResponse`, `ConvertedVoiceResponse`, `FileVoiceResponse`, `OpusVoiceResponse`, `StreamVoiceResponse` response types for handling audio responses.

### Deprecated
- `VoiceResponse` response type. Please switch to the response types listed above.

## [0.4.0]
### Changed
- Custom `Response` classes no longer receive the command handler's `context` automatically in their executor functions.
- `VoiceResponse` now takes the handler's context as its first argument in addition to its existing arguments.

## [0.3.0]
### Added
- `@me` prefix for selfbots.
- Additional filter middleware.
- Command groups.
- Service dependency declaration within command configurations.

### Changed
- `ServiceRegistry#fetch()` is now `ServiceRegistry#get()`.
- `ServiceRegistry#bind()` has been split up into `#bind()`, `#singleton()` and `#instance()`.
- `dispatchError` event has been changed to `dispatchFail`. This event now emits two arguments: the type of failure encountered and an object with the failure context.
- `@self` prefix is now `@client`.
- Command registration moved to client's command registry's `add()` method. Client dispatcher is now a private property.

### Removed
- Function configuration support for `configure()`.
- `unload()` method for removing registered commands.
- `provide()` middleware for injecting services.

## [0.2.2]
### Fixed
- Patch for npm release.

## [0.2.1]
### Fixed
- Exports for responses and middleware.
- Incorrect default value for `configure()`.

## [0.2.0]
### Changed
- Refactored from the ground up. Check the [docs](https://ghastly.js.org) for information.

## [0.1.4]
No change notes available.

## [0.1.3]
No change notes available.

## [0.1.2]
No change notes available.

## [0.1.1]
No change notes available.

[Unreleased]: https://github.com/hkwu/ghastly/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/hkwu/ghastly/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/hkwu/ghastly/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/hkwu/ghastly/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/hkwu/ghastly/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/hkwu/ghastly/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/hkwu/ghastly/compare/v0.1.4...v0.2.0
[0.1.4]: https://github.com/hkwu/ghastly/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/hkwu/ghastly/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/hkwu/ghastly/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/hkwu/ghastly/compare/v0.1.0...v0.1.1
