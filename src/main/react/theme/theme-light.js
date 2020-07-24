import { createMuiTheme } from "@material-ui/core/styles";
import { blueGrey, green, red } from "@material-ui/core/colors";

export const themeLight = createMuiTheme({
  palette: {
    primary: {
      main: "#fcde00"
    },
    secondary: blueGrey,
    success: green,
    error: red
  },
  overrides: {
    MuiDialogTitle: {
      root: { backgroundColor: "#fcde00" }
    }
  }
});
