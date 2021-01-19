import React from "react";
import Typography from "@material-ui/core/Typography";
import {useUserMe} from "../../hooks/UserMeHook";
import {DashboardHoursChart} from "../../components/charts/DashboardHoursChart";
import {Container, Grid} from "@material-ui/core";

export function HomeFeature() {

  const user = useUserMe();

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">Welcome in workday</Typography>
          <Typography>You are logged in as {user && user.name}</Typography>
        </Grid>
        <Grid item xs={12}>
          <DashboardHoursChart/>
        </Grid>
      </Grid>
    </Container>
  );
}
