# Changelog

All notable changes to LanBeam are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.3] - 2026-08-05

### Added

- Standalone macOS (Intel and Apple Silicon), Linux x64, and Windows x64 release binaries.
- A curl installer at `https://lanbeam.k1nz.top/install.sh` with SHA-256 verification and shell PATH setup.
- Automated winget manifest generation for `k1nz.LanBeam` and npm publish on version tags.

### Fixed

- Quote installer variable expansions so bash with `set -u` no longer treats `$ASSET。` as an unbound name under Chinese locales.
- Surface a clearer error when the selected platform binary is missing from GitHub Releases.

## [1.0.2] - 2026-08-05

### Fixed

- Use a pnpm 8-compatible lockfile so the frozen-lockfile GitHub Actions release install succeeds.

## [1.0.0] - 2026-08-05

### Added

- Local-first LAN file and folder sharing with upload, browsing, download, deletion, and filename conflict detection.
- Real-time text sharing and in-memory image sharing between devices on the same network.
- Browser-based LAN access with automatic server discovery and shareable access links.
- The global `lanbeam` npm CLI, with `--port` and `--max-size` options.
- A standalone Windows x64 executable, published with a SHA-256 checksum.

### Changed

- The built client, HTTP API, and WebSocket service now run from one command and one port.
- Uploaded files are stored in `lanbeam-files/` in the directory where LanBeam is started.

### Fixed

- Chinese filenames are preserved during uploads and downloads.
- The service continues to start when LAN interface addresses cannot be read.
