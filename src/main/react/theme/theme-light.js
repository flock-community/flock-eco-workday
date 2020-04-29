import {createMuiTheme} from "@material-ui/core/styles"
import {blueGrey} from "@material-ui/core/colors"

export const themeLight = createMuiTheme({
  palette: {
    primary: {
      main: "#fcde00",
    },
    secondary: blueGrey,
  },
  overrides: {
    MuiDialogTitle: {
      root: {backgroundColor: "#fcde00"},
    },
  },
})
