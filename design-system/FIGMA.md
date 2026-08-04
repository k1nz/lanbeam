# Importing this design language into Figma

Cloud agent environment had no Figma MCP / API token, so a live `.fig` could not be created remotely. Artifacts below are the source of truth and map 1:1 to the planned Figma structure. Open the HTML artboards + PNG exports as visual reference while rebuilding Variables / Components in Figma.

## Recommended Figma file structure

Create a new Design file named **File Transfer — Design System**, then:

1. Page `Design System`
   - Frame `Tokens / Color`
   - Frame `Tokens / Typography`
   - Frame `Tokens / Spacing & Radius`
   - Frame `Components` (Button, IconButton, Tab, Badge, Input, Toast, Modal, Dropzone, FileRow, ImageTile)
2. Page `Desktop`
   - Frame `Files / Empty` · 1440×1024
   - Frame `Files / Populated` · 1440×1024
   - Frame `Text Share / Connected` · 1440×1024
   - Frame `Overlay / Conflict`
   - Frame `Overlay / Share`
   - Frame `Overlay / Server Settings`

## Import tokens (Tokens Studio)

1. Install [Tokens Studio for Figma](https://tokens.studio/).
2. Open Tokens → Import → choose [`tokens/tokens.studio.json`](tokens/tokens.studio.json).
3. Push to Figma Variables (colors, spacing, radii). Create text styles from the `font.*` tokens manually if your plugin version does not sync type automatically.
4. Bind component properties to semantic variables (`color.bg`, `color.fg`, `color.primary`, …).

## Visual reference (HTML artboards)

Open locally:

```bash
# from repo root
python3 -m http.server 8765 --directory design-system/preview
# then visit http://localhost:8765/
```

- `index.html` — Design System page (tokens + components)
- `screens.html` — Desktop core screens + overlays

These artboards match the planned Figma frames and can be pasted into Figma via **screenshot → place**, or rebuilt with Variables + components using this doc as the checklist.

## Mapping to code

| Design | Code |
|--------|------|
| Shell / Tabs | `client/src/App.tsx` |
| Dropzone / pending upload | `client/src/components/FileUploader.tsx` |
| File tree | `client/src/components/FileTree.tsx` |
| Text share | `client/src/components/TextShare.tsx` |
| Conflict modal | `client/src/components/ConflictModal.tsx` |
| Share popover | `client/src/components/ShareButton.tsx` |
| Server settings | `client/src/components/ServerSettings.tsx` |
| Toast | `client/src/components/Toast.tsx` |
| CSS variables (future align) | `design-system/tokens/css-variables.css` |
