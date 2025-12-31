import { createTheme } from '@mui/material';
import { blueGrey, green, red } from '@mui/material/colors';
import { styled } from '@mui/material/styles';

export const themeLight = createTheme({
  palette: {
    primary: {
      main: '#fcde00',
      dark: '#fcde00', // only in use for DateRangePicker
    },
    secondary: blueGrey,
    success: green,
    error: red,
    // @ts-expect-error
    done: 'hotpink',
  },
  components: {
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#fcde00',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        color: 'primary',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          variants: [
            {
              props: { variant: 'outlined' },
              style: {
                color: theme.palette.text.primary,
                borderColor: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.paper,
                },
              },
            },
            {
              props: { variant: 'text' },
              style: {
                color: theme.palette.text.primary,
                borderColor: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.paper,
                },
              },
            },
          ],
        }),
      },
    },
  },
});

export const HighlightSpan = styled('span')(({ theme }) => ({
  position: 'relative',
  fontFamily: theme.typography.fontFamily,
  '&::before': {
    content: '""',
    backgroundColor: theme.palette.primary.main,
    width: '100%',
    height: '.9em',
    position: 'absolute',
    zIndex: '-1',
    filter: 'url(#markerShape)',
    left: '-0.15em',
    top: '0.1em',
    padding: '0 0.15em',
  },
}));
