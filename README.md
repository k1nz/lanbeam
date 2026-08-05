# LanBeam

[中文文档](./README.zh-CN.md)

LanBeam is a small, local-first tool for moving files and sharing notes on a LAN. Start it on one machine, then open the printed address from any browser on the same network. There are no accounts and no cloud service in the middle.

## What it does

- Upload files or folders, then browse, download, or remove them from a shared file list.
- Keep a short shared note in sync across open devices.
- Paste an image into the note to share it immediately. The server keeps the latest 20 images in memory only.
- Copy the LAN address from the page and send it to another device.

Uploads are stored on the machine running LanBeam. Shared text and images are cleared when the server stops.

## Get started

### macOS and Linux

Install the standalone command-line program; Node.js is not required:

```bash
curl -fsSL https://lanbeam.k1nz.top/install.sh | bash
lanbeam
```

The installer downloads a verified binary for macOS (Apple Silicon or Intel) or Linux x64, installs it in `~/.local/bin`, and adds that directory to the current shell's startup file when needed. To install a specific release or avoid modifying shell configuration:

```bash
curl -fsSL https://lanbeam.k1nz.top/install.sh | bash -s -- --version 1.0.3 --skip-shell
```

### Windows

After the [Windows Package Manager submission](https://github.com/microsoft/winget-pkgs) has been merged, install the portable command with:

```powershell
winget install k1nz.LanBeam
```

Until then, download `lanbeam-win-x64.exe` from [GitHub Releases](https://github.com/k1nz/lanbeam/releases). Run it from the directory where you want uploads to live:

```powershell
.\lanbeam-win-x64.exe
```

Open a URL printed in the terminal. Files are stored in `lanbeam-files/` in the current directory. Windows may ask for SmartScreen or firewall approval; allow private-network access if other LAN devices need to connect.

### npm alternative

Requires Node.js 18 or later:

```bash
npm install --global lanbeam
lanbeam
```

The command prints local and LAN addresses. Uploaded files are written to `lanbeam-files/` in the directory where you run it.

### Uninstall

Remove the installed binary and the `# lanbeam PATH` block that the installer added to your shell profile:

```bash
rm -f ~/.local/bin/lanbeam
```

### From source

Requires Node.js 18+ and pnpm 8+:

```bash
pnpm install
pnpm dev
```

During development, the client runs on `http://localhost:3000` and the API runs on `http://localhost:3001`.

## Command-line options

```bash
# Use a specific port
lanbeam --port 8080

# Limit each uploaded file to 500 MB
lanbeam --max-size 500

# See all options
lanbeam --help
```

The Windows executable accepts the same options. By default, each file can be up to 200 MB. If the selected port is in use, LanBeam tries the next available port.

## Using another device

1. Connect both devices to the same Wi-Fi or wired network.
2. Start LanBeam and copy a LAN URL printed in the terminal.
3. Open that URL on the other device.

For source development, run `pnpm network` to print LAN IP addresses. Use `http://<computer-ip>:3000` for the client; if needed, set its server URL to `http://<computer-ip>:3001` from the settings button.

## Build from source

```bash
pnpm build          # Build the client and server
pnpm start          # Start the built server
pnpm package:all    # Create all standalone release binaries
```

Creating standalone binaries requires Node.js 24. The npm CLI and regular source development support Node.js 18+.

## Releases

All user-facing changes are recorded in [CHANGELOG.md](./CHANGELOG.md). When preparing a release, move the relevant items from `Unreleased` into a versioned section before creating its Git tag.

Pushing a tag such as `v1.0.0` triggers a GitHub Actions release with macOS, Linux, and Windows standalone binaries, a SHA-256 checksum file, generated winget manifests, and the matching version section from `CHANGELOG.md`. The tag must match `package.json`; publishing the npm package requires the `NPM_TOKEN` repository secret.

See [release maintenance](./docs/releasing.md) for GitHub Pages/DNS setup and submitting each Windows release to winget.

## Stack

- TypeScript, compiled with `tsgo`
- React, Vite, and Tailwind CSS
- Node.js, Express, Multer, and `ws`

## License

[MIT](./LICENSE)
