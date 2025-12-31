import React from "react";
import { CircularProgress, Grid2, Theme } from "@mui/material";
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
    <Grid2
      style={{ height }}
      className={classes.root}
      container
      alignItems="center"
      justifyContent="center"
    >
      <Grid2>
        <CircularProgress />
      </Grid2>
    </Grid2>
  );
}
