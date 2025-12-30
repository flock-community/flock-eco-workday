import React from "react";
import { CircularProgress, Grid, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

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
      item
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
