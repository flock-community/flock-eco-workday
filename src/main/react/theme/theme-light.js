import { blueGrey, green, red } from "@material-ui/core/colors";
import { createTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export const themeLight = createTheme({
  palette: {
    primary: {
      main: "#fcde00",
      dark: "#fcde00", // only in use for DateRangePicker
    },
    secondary: blueGrey,
    success: green,
    error: red,
    done: "hotpink",
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

export const highLightClass = makeStyles((theme) => ({
  highlight: {
    position: "relative",
    "&::before": {
      content: '""',
      backgroundColor: theme.palette.primary.main,
      width: "100%",
      height: ".9em",
      position: "absolute",
      zIndex: "-1",
      filter: "url(#markerShape)",
      left: "-0.15em",
      top: "0.1em",
      padding: "0 0.15em",
    },
  },
}));
