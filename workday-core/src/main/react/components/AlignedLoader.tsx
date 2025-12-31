import React from "react";
import { CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";

type AlignedLoaderProps = {
  height?: number;
};

export function AlignedLoader({ height }: AlignedLoaderProps) {
  return (
    <Grid
      sx={{ height: height || "100%" }}
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
