# Design

Visual system for Flock Workday. Implemented in MUI v7 via a single token layer
(`workday-application/src/main/react/theme/`). Colours are designed in OKLCH for
perceptual consistency and emitted as hex/rgb so MUI's colour manipulators
(lighten/darken/alpha for hover and focus states) keep working.

## Color

Strategy: **committed**. The Flock yellow carries real surface presence (app bar,
primary actions, the marker highlight) against warm, low-chroma neutrals. Neutrals
are tinted toward the yellow hue (~100) so nothing is a dead grey, and pure
`#000`/`#fff` are never used.

### Brand

- Yellow / primary: `#fcde00` (oklch 0.90 0.185 103). The brand. contrastText is
  warm near-black; the yellow is never a background for white text.
- Yellow hover/active: light `#fde64d`, dark `#e6cb00`.

### Light theme

- background.default: `#faf8f0` (warm off-white)
- background.paper: `#fffdf5`
- text.primary: `#1c1b14`, text.secondary: `#5c594c`
- divider: `rgba(28,27,20,0.10)`
- secondary (slate): `#48566a`

### Dark theme

- background.default: `#17160f` (warm near-black)
- background.paper: `#211f16`
- text.primary: `#f5f2e6`, text.secondary: `#b4ae99`
- divider: `rgba(245,242,230,0.12)`
- secondary (slate): `#aab6c6`

### Semantic

success `#3a8a4a` / dark `#5cb96b`; error `#c0392b` / dark `#e57368`; warning
(orange, kept distinct from brand yellow) `#c8791b` / dark `#e0973a`; info
`#2c7a7b` / dark `#5fb6b7`.

## Typography

Roboto (already loaded). Hierarchy via scale + weight contrast, not colour.

- h1 3rem / 700 / -0.02em, h2 2.25rem / 700 / -0.015em, h3 1.75rem / 700,
  h4 1.375rem / 600, h5 1.15rem / 600, h6 1rem / 600.
- body1 1rem / 1.6, body2 0.9rem / 1.55. Body line length capped ~70ch where prose.
- button: weight 600, `textTransform: none` (no MUI uppercase), letter-spacing 0.
- overline/caption used for metadata; warm text.secondary.

## Shape & spacing

- Base spacing unit 8px (MUI default); rhythm varies deliberately (section gaps wider
  than intra-card gaps). Existing `flow` / `gid-auto-fit` utilities in `index.html`
  are retained.
- borderRadius: 10 (cards/dialogs/inputs), pills for chips.

## Elevation

Soft, warm-tinted shadows instead of MUI's default grey stack. Cards rest on a 1px
divider border + a low, diffuse shadow; raise on hover. Dialogs get a deeper, still
soft shadow. No harsh `0 1px 3px rgba(0,0,0,.2)` defaults.

## Components

- **AppBar**: brand yellow, dark text/icons, thin bottom hairline, no heavy shadow.
  Holds the menu button, "Flock. Workday" wordmark, a light/dark toggle, and the
  account menu.
- **Drawer**: branded header (wordmark + version), list items with rounded hover and
  a yellow active indicator (left accent via background tint + weight, not a stripe
  border).
- **Buttons**: contained primary = yellow with dark text; outlined/text use ink
  colour; no uppercase; gentle radius; restrained shadow.
- **Cards**: 1px divider border, radius 10, soft shadow, hover lift on interactive
  cards.
- **DialogTitle**: yellow remains the brand cue but refined (clean weight/padding).
- **Inputs / tables**: refined borders, header weight on tables, comfortable density.

## Motion

Ease-out (expo/quint) on hover lifts, color-mode crossfade, and dialog entrance.
No layout-property animation, no bounce. Respect `prefers-reduced-motion`.

## Signature

The hand-drawn marker highlight (`HighlightSpan` + the `#markerShape` SVG turbulence
filter in `index.html`) is the brand's human touch. Kept and reusable beyond the home
greeting.
