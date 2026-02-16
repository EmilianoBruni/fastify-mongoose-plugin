# fastify-mongoose-plugin - Changelog

_A modern Fastify plugin with support for Typescript, ES6/commonJS module, to connect to a MongoDB instance via the Mongoose ODM_

## [0.3.0] - 2026-02-16

### Added

- Required Fastify >= 5.6
- Add `modelPathFilter` options to filter to include/exclude files and load custom extensions containing valid JS modules

### Fixed

- Fix type definitions

## [0.2.1] - 2025-11-20

### Fixed

- Include TypeScript files in model directory traversal

## [0.2.0] - 2025-04-07

### Added

- Required Fastify 5.x
- Required Node.js >= 20.x

### Fixed

- Validation logics

## [0.1.3] - 2024-03-04 [Last for Fastify 4.x]

### Added

Documentation

### Changed

- In modelDirPath, now only .js extension files are loaded.

### Fixed

- Documentation

## [0.1.2] - 2024-02-21

### Fixed

- Problem in exporting typescript declarations.

## [0.1.1] 2024-02-21

### Added

- Exported TFMPPlugin, TFMPModel, TFMPModels, TFMPOptions, TFMPSchema types

## [0.1.0] - 2024-02-06

### Added

- First public release

[0.3.0]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.3.0
[0.2.1]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.2.1
[0.2.0]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.2.0
[0.1.3]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.1.3
[0.1.2]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.1.2
[0.1.1]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.1.1
[0.1.0]: https://github.com/EmilianoBruni/fastify-mongoose-plugin/releases/tag/v0.1.0
