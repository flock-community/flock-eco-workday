import { styled } from '@mui/material/styles';
import { createAppTheme } from './createAppTheme';

export const themeLight = createAppTheme('light');

export const HighlightSpan = styled('span')(({ theme }) => ({
  position: 'relative',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.primary.contrastText,
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
