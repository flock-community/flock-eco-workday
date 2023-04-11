import { blueGrey, green, red } from "@material-ui/core/colors";
import { createTheme } from "@material-ui/core";

export const themeLight = createTheme({
  palette: {
    primary: {
      main: "#fcde00",
      dark: "#fcde00", // only in use for DateRangePicker
    },
    secondary: blueGrey,
    success: green,
    error: red,
  },
  overrides: {
    MuiDialogTitle: {
      root: { backgroundColor: "#fcde00" },
    },
  },
  props: {
    MuiButton: {
      variant: "contained",
      color: "primary",
    },
    link: {
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
    },
  },
});
