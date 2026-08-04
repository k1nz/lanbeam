# File Transfer — Desktop pages

Overrides relative to [MASTER.md](../MASTER.md). Use when composing Figma frames or HTML artboards.

## Layout shell

- Width: `1440` artboard · content column `1280` centered · gutter `24`
- Sticky header `64` with hairline bottom border
- Segmented Tab under header, then one primary content stack
- Connection banner at bottom of content (not chrome)

## Files — empty

Purpose: first-run upload path.
- Dropzone is the only hero interaction (no cards inside cards)
- Correct helper copy: any file type, server limit (default 200MB) — not “SVG 800×400”
- Empty file table with muted caption

## Files — populated

Purpose: browse / download / delete.
- Tree rows: indent by level × 16
- Hover reveals download + delete icon buttons (≥36 hit area)
- Folder expand chevron; file type chips stay monochrome badges (PDF/IMG/…)

## Text share

Purpose: realtime clipboard board.
- Connection badge next to title (dot + label, not color alone)
- Textarea min-height ~220
- Image grid 4-col desktop; hover actions copy / delete
- Header actions: copy text, clear text, clear all

## Overlays

- Conflict modal: list of names, Cancel + Danger “覆盖文件”
- Share popover: URL mono truncate + Copy
- Server settings: URL input, test / auto-detect / save / reset
