import {MuiThemeProvider} from "@material-ui/core/styles"
import lightTheme from "../theme/theme-light"

export const config = function() {
  MuiThemeProvider.defaultProps = {
    theme: lightTheme,
  }
}
