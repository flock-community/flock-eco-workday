import { cyan, green, orange, red } from '@mui/material/colors';
import type { PaletteOptions, Shadows } from '@mui/material/styles';
import type { TypographyVariantsOptions } from '@mui/material/styles/createTypography';

// Custom palette key used by status components (StatusMenu "DONE" state).
declare module '@mui/material/styles' {
  interface Palette {
    done: string;
  }
  interface PaletteOptions {
    done?: string;
  }
}

// Flock brand. Designed in OKLCH for perceptual consistency, emitted as hex so
// MUI's colour manipulators (lighten/darken/alpha) keep working for hover/focus.
export const brand = {
  yellow: '#fcde00', // oklch(0.90 0.185 103)
  yellowLight: '#fde64d',
  yellowDark: '#e6cb00',
  ink: '#1c1b14', // warm near-black, contrast on yellow
} as const;

// Semantic states reuse MUI's accessible ramps so the full shade range stays
// available to existing consumers (StatusMenu, WorkDayDialog index `success[200]`).
const semantic = { success: green, error: red, warning: orange, info: cyan };

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: brand.yellow,
    light: brand.yellowLight,
    dark: brand.yellowDark,
    contrastText: brand.ink,
  },
  secondary: {
    main: '#48566a',
    light: '#6b7686',
    dark: '#323d4d',
    contrastText: '#fffdf5',
  },
  ...semantic,
  done: '#3f7cac',
  background: { default: '#faf8f0', paper: '#fffdf5' },
  text: {
    primary: brand.ink,
    secondary: '#5c594c',
    disabled: 'rgba(28, 27, 20, 0.38)',
  },
  divider: 'rgba(28, 27, 20, 0.10)',
  action: {
    hover: 'rgba(28, 27, 20, 0.045)',
    selected: 'rgba(252, 222, 0, 0.18)',
    focus: 'rgba(28, 27, 20, 0.10)',
  },
};

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: brand.yellow,
    light: brand.yellowLight,
    dark: brand.yellowDark,
    contrastText: brand.ink,
  },
  secondary: {
    main: '#aab6c6',
    light: '#c4cdd9',
    dark: '#7e8a9b',
    contrastText: '#16150f',
  },
  ...semantic,
  done: '#6fa8d6',
  background: { default: '#17160f', paper: '#211f16' },
  text: {
    primary: '#f5f2e6',
    secondary: '#b4ae99',
    disabled: 'rgba(245, 242, 230, 0.38)',
  },
  divider: 'rgba(245, 242, 230, 0.12)',
  action: {
    hover: 'rgba(245, 242, 230, 0.06)',
    selected: 'rgba(252, 222, 0, 0.20)',
    focus: 'rgba(245, 242, 230, 0.12)',
  },
};

export const typography: TypographyVariantsOptions = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3rem',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.015em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.375rem',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.005em',
  },
  h5: { fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.3 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
  subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.9rem', lineHeight: 1.55 },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
  overline: {
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontSize: '0.72rem',
  },
  caption: { fontSize: '0.78rem', lineHeight: 1.4 },
};

// Soft, warm-tinted elevation in place of MUI's default grey stack.
export function softShadows(mode: 'light' | 'dark'): Shadows {
  const rgb = mode === 'dark' ? '0, 0, 0' : '28, 27, 14';
  const m = mode === 'dark' ? 1.8 : 1;
  const lvl = (
    y1: number,
    b1: number,
    o1: number,
    y2: number,
    b2: number,
    o2: number,
  ) =>
    `0px ${y1}px ${b1}px rgba(${rgb}, ${(o1 * m).toFixed(3)}), ` +
    `0px ${y2}px ${b2}px rgba(${rgb}, ${(o2 * m).toFixed(3)})`;

  const e1 = lvl(1, 2, 0.05, 0, 1, 0.06);
  const e2 = lvl(2, 5, 0.06, 1, 2, 0.05);
  const e3 = lvl(3, 8, 0.07, 1, 3, 0.05);
  const e4 = lvl(5, 12, 0.08, 2, 4, 0.05);
  const e6 = lvl(7, 18, 0.09, 2, 6, 0.06);
  const e8 = lvl(10, 26, 0.11, 3, 9, 0.06);
  const e12 = lvl(14, 34, 0.13, 4, 12, 0.07);
  const e16 = lvl(18, 44, 0.15, 6, 16, 0.08);
  const e24 = lvl(26, 60, 0.2, 9, 22, 0.09);

  return [
    'none',
    e1,
    e1,
    e2,
    e2,
    e3,
    e3,
    e4,
    e4,
    e6,
    e6,
    e6,
    e6,
    e8,
    e8,
    e8,
    e8,
    e12,
    e12,
    e12,
    e12,
    e16,
    e16,
    e16,
    e24,
  ] as unknown as Shadows;
}
