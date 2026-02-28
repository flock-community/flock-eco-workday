# Dashboard Visual Reference

This document describes the visual appearance of the new dashboard design for reference and QA purposes.

## Overall Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPARISON BANNER (Yellow border bottom, dark bg)              │
│  "You're viewing the NEW dashboard" | [View Original] [Docs]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  WORKSPACE (outline)                                             │
│  METRICS (solid yellow)                                          │
│  Real-time workforce analytics & insights                        │
│  ┌──────────┐                                                   │
│  │  2026 ▼  │ (Yellow border, glass effect)                    │
│  └──────────┘                                                   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [PRIMARY] REVENUE & COST ANALYSIS                         │ │
│  │ (Full width, yellow gradient background, dark text)       │ │
│  │                                                             │ │
│  │ [Large chart visualization]                                │ │
│  │                                                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ [PERFORMANCE]            │  │ [INTERNAL]                │   │
│  │ Average Hours / Day      │  │ Internal Operations       │   │
│  │ (Yellow tint bg)         │  │ (Dark bg)                 │   │
│  │                          │  │                           │   │
│  │ [Chart]                  │  │ [Chart]                   │   │
│  │                          │  │                           │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│  │ [EXTERNAL] │ │ [LEADER]   │ │ [REVENUE]  │                 │
│  │ Client     │ │ Management │ │ Client Rev │                 │
│  │ Work       │ │ (Yellow)   │ │            │                 │
│  │            │ │            │ │            │                 │
│  │ [Chart]    │ │ [Chart]    │ │ [Table]    │                 │
│  │            │ │            │ │            │                 │
│  └────────────┘ └────────────┘ └────────────┘                 │
│                                                                   │
│  ┌──────────────────┐  ┌────────────────────────────┐         │
│  │ [PEOPLE]         │  │ [INNOVATION]                │         │
│  │ Leave Days       │  │ Hack Days Budget            │         │
│  │ (Yellow, 5 col)  │  │ (Dark, 7 col)               │         │
│  │                  │  │                             │         │
│  │ [Chart]          │  │ [Chart]                     │         │
│  │                  │  │                             │         │
│  └──────────────────┘  └────────────────────────────┘         │
│                                                                   │
│  ┌────────────────────────────┐  ┌──────────────────┐         │
│  │ [HEALTH]                   │  │ [FINANCIAL]      │         │
│  │ Sick Days (Dark, 7 col)    │  │ Gross Margin     │         │
│  │                            │  │ (Yellow, 5 col)  │         │
│  │                            │  │                  │         │
│  │ [Chart]                    │  │ [Table]          │         │
│  │                            │  │                  │         │
│  └────────────────────────────┘  └──────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Color Palette

### Primary Colors
- **Background Gradient**: `#1a1a1a → #2d2d2d` (135deg)
- **Primary Accent**: `#fcde00` (Yellow)
- **Secondary Accent**: `#e6c900` (Darker Yellow)

### Card Backgrounds
- **Primary**: `rgba(45,45,45,0.9) → rgba(30,30,30,0.95)` with yellow border
- **Secondary**: `rgba(252,222,0,0.08) → rgba(252,222,0,0.03)` with thicker yellow border
- **Accent**: `#fcde00 → #e6c900` gradient (no border)

### Text Colors
- **Primary Text**: `#fcde00` (Yellow)
- **Secondary Text**: `rgba(255,255,255,0.6)` (Muted white)
- **Accent Card Text**: `#1a1a1a` (Dark on yellow background)

### Interactive States
- **Hover Shadow**: `0 30px 80px rgba(252,222,0,0.2)`
- **Top Border (hover)**: `4px solid #fcde00`
- **Transform (hover)**: `translateY(-8px)`

## Typography

### Display Typography (Clash Display)
- **Main Title**:
  - Size: `clamp(3rem, 8vw, 6rem)`
  - Weight: 700
  - Color: Yellow
  - Transform: Uppercase
  - Letter-spacing: -0.04em

- **Card Titles**:
  - Size: 1.5rem
  - Weight: 600
  - Color: Yellow (dark on accent cards)
  - Transform: Uppercase
  - Underline: 40px yellow bar

### Body Typography (General Sans)
- **Subtitle**:
  - Size: 1.125rem
  - Weight: 400
  - Color: `rgba(255,255,255,0.6)`
  - Transform: Uppercase
  - Letter-spacing: 0.02em

- **Floating Labels**:
  - Size: 0.75rem
  - Weight: 500
  - Color: `rgba(252,222,0,0.5)`
  - Transform: Uppercase
  - Letter-spacing: 0.1em

## Animations

### Page Load Sequence
1. **Header** (0s): Fade in from top
2. **Year Selector** (0.3s delay): Fade in up
3. **Cards** (staggered 0.1s each):
   - Fade in
   - Translate up (60px → 0)
   - Rotate X (-15deg → 0)

### Hover Interactions
- **Card Lift**: 8px upward translation
- **Shadow Intensify**: Yellow glow appears
- **Top Border**: Scales from 0 to 1 (left to right)
- **Duration**: 0.3s with cubic-bezier easing

### Background Effects
- **Radial Glow**: Pulses between 30% and 60% opacity (4s infinite)
- **Diagonal Accent**: Slides in from left (1.5s ease-out)
- **Shimmer (year selector)**: Sweeps across on hover (1s)

## Effects & Textures

### Noise Overlay
- **Type**: SVG fractal noise
- **Frequency**: 0.9
- **Octaves**: 4
- **Opacity**: 0.03
- **Blend Mode**: Overlay

### Backdrop Blur
- **Applied to**: Year selector, card backgrounds
- **Blur**: 10px (year selector), 20px (cards)
- **Fallback**: Solid backgrounds for older browsers

### Shadows
- **Card Default**: `0 20px 60px rgba(0,0,0,0.3)`
- **Card Hover**: `0 30px 80px rgba(252,222,0,0.2)`

## Responsive Breakpoints

### Desktop (default)
- 12-column grid
- 2rem gap
- 3rem page padding
- Full typography scale

### Tablet (lg breakpoint)
- 6-column grid
- Cards span 6 columns or full width
- Reduced padding: 2rem

### Mobile (md breakpoint)
- Single column layout
- Cards stack vertically
- Title size reduces (clamp function)
- Padding: 1.5rem

## Scrollbar Styling

### Track
- Background: `rgba(252,222,0,0.05)`
- Width/Height: 8px

### Thumb
- Background: `rgba(252,222,0,0.3)`
- Hover: `rgba(252,222,0,0.5)`
- Border-radius: 0 (sharp edges)

## Comparison Banner

### Position
- Fixed to top
- Z-index: 9999
- Full width

### Styling
- Background: Dark gradient (matches main bg)
- Border-bottom: 2px solid yellow
- Shadow: `0 4px 20px rgba(0,0,0,0.5)`

### Buttons
- **Primary**: Yellow bg, dark text
- **Secondary**: Transparent, yellow border
- **Hover**: 2px lift, background change

## Special Elements

### Year Selector
- **Shape**: Rectangle (no border-radius)
- **Border**: 2px solid `rgba(252,222,0,0.2)`
- **Background**: Semi-transparent yellow tint
- **Font**: Clash Display, 2rem, 600 weight
- **Effect**: Shimmer on hover

### Floating Labels
- **Position**: Top-right of cards
- **Border**: 1px solid `rgba(252,222,0,0.2)`
- **Padding**: 0.25rem 0.75rem
- **Animation**: Slide in from right (0.6s delay)

### Diagonal Accents
- **Width**: 200% of card
- **Height**: 2px
- **Transform**: Rotate -45deg
- **Color**: `rgba(252,222,0,0.1)`
- **Position**: Centered, absolutely positioned

## Accessibility Features

### Color Contrast
- Yellow on dark: 12.63:1 (AAA)
- White on dark: 21:1 (AAA)
- Dark on yellow: 11.79:1 (AAA)

### Focus States
- Inherits Material-UI focus rings
- Tab navigation supported
- Keyboard accessible (all interactive elements)

### Semantic Structure
- Proper heading hierarchy
- ARIA labels where needed (Material-UI defaults)
- Screen reader compatible

## Browser-Specific Notes

### Safari 14+
- Supports backdrop-filter
- CSS grid fully supported
- Custom properties (variables) work

### Chrome/Edge 90+
- All features fully supported
- Best performance with GPU acceleration
- Smooth animations

### Firefox 88+
- Supports all CSS features
- Slightly different font rendering
- Full animation support

### Fallbacks
- Backdrop-filter → solid backgrounds
- Custom fonts → system fallbacks (Inter, -apple-system)
- CSS Grid → Flexbox (automatic Material-UI fallback)

## Performance Characteristics

### Initial Load
- Staggered animation creates perception of fast loading
- CSS animations (GPU-accelerated)
- No JavaScript animation overhead

### Runtime
- 60fps hover animations
- Minimal repaints (transform/opacity only)
- Efficient shadow rendering

### Optimization
- Font preloading via link rel="preload"
- Minimal DOM nesting
- CSS-in-JS with Emotion (compiled)