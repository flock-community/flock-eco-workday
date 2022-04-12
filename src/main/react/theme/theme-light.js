import { blueGrey, green, red } from "@material-ui/core/colors";
import { createTheme } from "@material-ui/core";

export const themeLight = createTheme({
  palette: {
    primary: {
      main: "#fcde00",
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
});
