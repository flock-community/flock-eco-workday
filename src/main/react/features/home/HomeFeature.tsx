import React from "react";
import Typography from "@material-ui/core/Typography";
import {useUserMe} from "../../hooks/UserMeHook";
import {DashboardHoursChart} from "../../components/charts/DashboardHoursChart";
import {Card, CardContent, CardHeader, Container, Grid} from "@material-ui/core";
import {DashboardHolidayChart} from "../../components/charts/DashboardHolidayChart";
import ContractsEnding from "../../components/contracts/ContractsEnding";

export function HomeFeature() {
  const user = useUserMe();

  const showContractsEnding =
    user?.authorities?.includes("ContractAuthority.ADMIN") ?? false

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">Welcome in workday</Typography>
          <Typography>You are logged in as {user && user.name}</Typography>
        </Grid>
        {showContractsEnding &&
          <Grid item xs={12}>
            <ContractsEnding withinNWeeks={6} />
          </Grid>
        }
        <Grid item xs={12}>
          <Card style={{overflow:"visible"}}>
            <CardHeader title={"Workdays"}/>
            <CardContent>
              <DashboardHoursChart/>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={"Holidays"}/>
            <CardContent>
              <DashboardHolidayChart/>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
