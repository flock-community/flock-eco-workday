import React from "react";
import { CircularProgress, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Grid from "@mui/material/Grid2";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
  },
}));

type AlignedLoaderProps = {
  height?: number;
};

export function AlignedLoader({ height }: AlignedLoaderProps) {
  const classes = useStyles();

  return (
    <Grid
      style={{ height }}
      className={classes.root}
      container
      alignItems="center"
      justifyContent="center"
    >
      <Grid>
        <CircularProgress />
      </Grid>
    </Grid>
  );
}
