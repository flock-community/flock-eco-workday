import { alpha, createTheme, type Theme } from '@mui/material/styles';
import { darkPalette, lightPalette, softShadows, typography } from './tokens';

export type ColorMode = 'light' | 'dark';

export function createAppTheme(mode: ColorMode): Theme {
  const base = createTheme({
    palette: mode === 'dark' ? darkPalette : lightPalette,
    typography,
    shape: { borderRadius: 10 },
    shadows: softShadows(mode),
  });

  const { palette, shadows } = base;
  const inkBorder = alpha(palette.text.primary, 0.28);

  return createTheme(base, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'primary' },
        styleOverrides: {
          root: {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText,
            borderBottom: `1px solid ${alpha(palette.primary.contrastText, 0.14)}`,
            boxShadow: shadows[2],
          },
        },
      },

      MuiButton: {
        defaultProps: {
          variant: 'contained',
          color: 'primary',
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            paddingInline: 16,
            transition: 'background-color 160ms ease, box-shadow 200ms ease',
          },
          contained: {
            '&:hover': { boxShadow: shadows[3] },
          },
        },
        variants: [
          {
            props: { variant: 'outlined' },
            style: {
              color: palette.text.primary,
              borderColor: inkBorder,
              '&:hover': {
                borderColor: palette.text.primary,
                backgroundColor: palette.action.hover,
              },
            },
          },
          {
            props: { variant: 'text' },
            style: {
              color: palette.text.primary,
              '&:hover': { backgroundColor: palette.action.hover },
            },
          },
        ],
      },

      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${palette.divider}`,
            boxShadow: shadows[1],
          },
        },
      },

      MuiCardHeader: {
        styleOverrides: {
          title: { fontSize: '1.05rem', fontWeight: 600 },
          subheader: { color: palette.text.secondary },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 16, boxShadow: shadows[24] },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText,
            fontWeight: 700,
            fontSize: '1.15rem',
            padding: '16px 24px',
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${palette.divider}`,
            boxShadow: shadows[8],
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 8,
            marginBlock: 2,
            '&.Mui-selected': {
              backgroundColor: alpha(palette.primary.main, 0.18),
              '&:hover': { backgroundColor: alpha(palette.primary.main, 0.26) },
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10 },
          notchedOutline: { borderColor: palette.divider },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: palette.divider },
          head: {
            fontWeight: 700,
            fontSize: '0.74rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: palette.text.secondary,
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500 },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? '#3a3729' : '#2a2820',
            color: '#fbf8ee',
            fontSize: '0.76rem',
            fontWeight: 500,
            borderRadius: 8,
            padding: '6px 10px',
          },
          arrow: { color: mode === 'dark' ? '#3a3729' : '#2a2820' },
        },
      },
    },
  });
}
