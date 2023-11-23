import { createTheme } from '@material-ui/core';
import { blueGrey, cyan, pink } from '@material-ui/core/colors';

export const darkTheme = createTheme({
  palette: {
    primary: {
      main: pink['A200'],
    },
    secondary: {
      main: cyan['A400'],
    },
    background: {
      default: blueGrey['800'],
      paper: blueGrey['700'],
    },
  },
});
