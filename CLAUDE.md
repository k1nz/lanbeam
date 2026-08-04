# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A local LAN file-transfer & sharing tool (conceptually a browser-based `http-server`). No accounts, no auth — any device on the same network can upload/download files and share text/images in real time. This is a **local-first tool**: there is no concept of users, uploaders, or multi-tenant ownership anywhere in the codebase — don't introduce one.

Monorepo (pnpm workspace) with two packages plus root scripts:

- `server/` — Express + `ws` (WebSocket). REST API for file CRUD + real-time text/image sharing.
- `client/` — React 18 + Vite + Tailwind. SPA that talks to the server.
- `scripts/network-info.ts` — prints LAN IPs (root tsconfig, compiled with tsgo).

All TypeScript is compiled with **tsgo** (the native Go compiler), not `tsc`. Each package has its own `tsconfig.json`.

## Commands

```bash
pnpm install        # install everything
pnpm dev            # run server + client together (client :3000, server :3001)
pnpm dev:server     # server only, via nodemon (rebuilds on src changes)
pnpm dev:client     # Vite dev server only
pnpm build          # build client, then server (order matters: client builds first)
pnpm start          # run built server (node dist/index.js)
pnpm typecheck      # tsgo --noEmit on server, client, and root scripts
pnpm network        # print the LAN IPs to share
pnpm clean          # wipe dist + uploads
```

There are **no tests** and no real lint configuration — don't assume they exist. `typecheck` is the verification gate.

## Architecture

### Server (`server/src/index.ts`)

A single file holding the whole backend. Three concerns:

1. **File REST API** (`/api/upload`, `/api/files`, `/api/download/*`, `/api/files/*` DELETE, `/api/check-files`). Uploads are written to `server/uploads/` via Multer disk storage, preserving folders from drag-drop uploads (uses a `relativePath[files[N]]` form field). Directory tree listing recurses through the uploads dir.
2. **WebSocket text/image sharing** (same HTTP server, `/`). Shared text and the last 20 images (max 10MB each) live **in memory only** — never on disk. Images travel as binary frames: 2-byte header length + JSON metadata header + raw image bytes. New connections are replayed the full current state (`sendFullState`). No persistence across restarts.
3. **Port auto-increment**: listens on 3001; on `EADDRINUSE` it retries incrementing up to 20 ports (3001→3020). The client discovers the actual port (see below), so the server must keep printing the real port at startup.

Key gotchas:

- **Chinese filenames**: Multer mangles non-ASCII names, so both upload and download paths decode/re-encode with `Buffer.from(name, 'latin1').toString('utf8')`. Preserve this whenever touching filename handling.
- Path traversal guards use `fullPath.startsWith(uploadDir)` — keep them.
- `maxFileSize` defaults to 200MB, overridable via `--max-size <MB>` or `MAX_FILE_SIZE`.

### Client

- `src/config/api.ts` — **server auto-discovery**: probes the default host across ports 3001–3020 in parallel, validating each candidate is actually this server (checks the `/` response includes "文件传输"). A manually saved URL in `localStorage['serverUrl']` takes priority; discovery updates only the in-memory `API_CONFIG.baseURL`, not the saved override.
- `src/components/serverContext.tsx` — `ServerProvider` runs discovery on mount, exposes `serverUrl`/`serverReady`/`refreshServer`, and toasts port-switch or connection-failure results. The rest of the app consumes it via `useServer()`.
- `src/types.ts` `FileNode` mirrors the server's `FileItem` interface — keep the two in sync.
- File table (`App.tsx` header + `FileTree.tsx` rows) uses fixed column widths (`w-24`, `w-28`, …) so header text and rows align — when changing columns, update **both** files' widths together.
- `TextShare.tsx` implements the ws binary-frame protocol matching the server: text messages and paste-to-share images.
- `FileUploader.tsx` handles drag-drop + folder uploads and conflict-check via `/api/check-files` before uploading.

### Design system

`docs/design/` holds a Vercel-inspired black & white design language (tokens, Figma guides, static HTML previews). It's a design reference, not runtime code — the client uses plain Tailwind classes, not these files.

## Conventions

- UI copy is Simplified Chinese; code comments are Chinese.
- Prefer lucide-react icons over hand-rolled SVGs in client components.
- Any column/size change in the file table must stay in sync between `App.tsx` (header) and `FileTree.tsx` (rows).

## Product direction: npm CLI package

The planned public product name is **LanBeam**:

- npm package name: `lanbeam`
- global installation: `npm i -g lanbeam`
- startup command: `lanbeam`

LanBeam should be distributed as a single npm package, similar to `http-server`. The global command must start the local server and client together, so users do not need to know the monorepo layout or run separate development commands. The package should include the built client assets and server runtime, preserve the existing local-first/LAN-only workflow, and continue to expose the actual server port when automatic port incrementing is needed.

When implementing this direction:

- Add a Node.js CLI entry point exposed through the package's `bin` field.
- Build/package the client and server artifacts as part of the release flow.
- Make `lanbeam` start both runtime pieces and report the URL that users should open.
- Keep the existing development commands (`pnpm dev`, `pnpm dev:server`, and `pnpm dev:client`) for repository development.
- Treat `lanbeam` as the public product command; package metadata, README examples, and help output should use this name consistently.
- `lanbeam` was selected after checking the current npm registry during planning; verify availability again before publishing and reserve the name if necessary.
