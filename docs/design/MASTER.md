# File Transfer — Design System (Master)

Vercel-inspired monochrome design language for the LAN file-transfer SPA.

## Product

- **Type**: Local productivity tool (file transfer + realtime text/image share)
- **Audience**: Peers on the same Wi‑Fi who need zero-login sharing
- **Tone**: Precise, quiet, engineering-grade — never playful or decorative

## Visual Direction

| Dial | Choice |
|------|--------|
| Style | Minimal / infrastructure UI (Vercel dashboard grammar) |
| Theme | Light, black–white–gray only (semantic status accents allowed) |
| Density | Medium-tight (16–64px section rhythm, 4px base grid) |
| Motion | Subtle (150–250ms opacity / transform) |

**Anti-patterns**: purple gradients, cream/serif editorial, broadsheet rules, glow, pill clusters, emoji icons, heavy card stacks in hero zones.

## Color Tokens

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#FFFFFF` | Page / surface |
| `bg-subtle` | `#FAFAFA` | Secondary surface, table header |
| `bg-muted` | `#F5F5F5` | Hover fill, input wash |
| `fg` | `#171717` | Primary text / icons |
| `fg-muted` | `#737373` | Secondary text |
| `fg-subtle` | `#A3A3A3` | Placeholder / disabled |
| `border` | `#E5E5E5` | Default border |
| `border-strong` | `#D4D4D4` | Emphasized border / focus fallback |
| `primary` | `#171717` | Primary button fill |
| `primary-fg` | `#FAFAFA` | On-primary text |
| `danger` | `#DC2626` | Destructive |
| `success` | `#16A34A` | Success |
| `warning` | `#D97706` | Warning |
| `focus` | `#171717` | Focus ring (2px + 2px offset) |

Contrast: body text on white ≥ 4.5:1; muted text ≥ 3:1 for large/secondary.

## Typography

- **Display / UI**: Geist Sans (fallback: `IBM Plex Sans`, `ui-sans-serif`)
- **Mono** (URLs, paths): Geist Mono / `IBM Plex Mono`

| Style | Size / Line / Weight |
|-------|----------------------|
| Display | 32 / 40 / 600 |
| Title | 20 / 28 / 600 |
| Heading | 16 / 24 / 600 |
| Body | 14 / 20 / 400 |
| Label | 13 / 18 / 500 |
| Caption | 12 / 16 / 400 |

## Spacing & Radius

- Scale: `4 8 12 16 20 24 32 40 48 64`
- Content max width: `1280px` (`max-w-7xl`)
- Page gutter: `24px`
- Radius: `sm 4` · `md 6` · `lg 8` · `xl 12`
- Prefer 1px borders over shadows; shadow only on floating panels: `0 8px 30px rgba(0,0,0,0.08)`

## Elevation

1. Flat surface (border only)
2. Popover / toast (border + soft shadow)
3. Modal scrim `rgba(0,0,0,0.4)` + elevated panel

## Components (foundation)

- Button: `primary` | `secondary` | `ghost` | `danger` × `sm` | `md` · states hover/focus/disabled
- IconButton: 36×36 hit target, 20px icon
- Tab: segmented control (selected = solid black)
- Input / Textarea
- Badge: connected / disconnected / info
- Toast: success | error | warning | info
- Modal: title + body + dual actions
- Dropzone: idle | drag-over
- File row: file | folder × hover actions
- Image tile: loading | loaded × hover actions

## Screens (desktop 1440)

1. Files — empty
2. Files — populated tree
3. Text share — connected with content
4. Overlay — conflict modal
5. Overlay — share popover
6. Overlay — server settings popover

## Motion

- Enter: 180ms ease-out opacity + 4px translateY
- Exit: 120ms ease-in
- Respect `prefers-reduced-motion`

## Accessibility

- Visible focus rings on all interactive controls
- Icon-only buttons require `aria-label`
- Destructive actions use danger color **and** text label
- Modal provides explicit dismiss / cancel
