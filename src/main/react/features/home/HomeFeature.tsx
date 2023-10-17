import React from "react";
import Typography from "@material-ui/core/Typography";
import {useUserMe} from "../../hooks/UserMeHook";
import {DashboardHoursChart} from "../../components/charts/DashboardHoursChart";
import {Card, CardContent, CardHeader, Container, Grid,} from "@material-ui/core";
import {DashboardLeaveDayTable} from "../../components/tables/DashboardLeaveDayTable";
import ContractsEnding from "../../components/contracts/ContractsEnding";
import PersonEvents from "../../components/person/PersonEvents";
import {DashboardLeaveDayChart} from "../../components/charts/DashboardLeaveDayChart";

export function HomeFeature() {
  const user = useUserMe();

  const hasAccess = user?.authorities?.length > 0;

  const showContractsEnding =
    user?.authorities?.includes("ContractAuthority.ADMIN") ?? false;

  const showPersonEvents =
    user?.authorities?.includes("PersonAuthority.READ") ?? false;

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h2">Welcome in workday</Typography>
          <Typography>You are logged in as {user && user.name}</Typography>
        </Grid>
        {!hasAccess && (<Grid item xs={12}>
            <Typography>No roles are assigned to your account.</Typography>
        </Grid>
        )}
        {showContractsEnding && (
          <Grid item xs={12}>
            <ContractsEnding withinNWeeks={6}/>
          </Grid>
        )}
        {showPersonEvents && (
          <Grid item xs={12}>
            <PersonEvents withinNWeeks={6}/>
          </Grid>
        )}
        {hasAccess && (
          <Grid item xs={12}>
            <Card style={{overflow: "visible"}}>
              <CardHeader title={"Workdays"}/>
              <CardContent>
                <DashboardHoursChart/>
              </CardContent>
            </Card>
          </Grid>
        )}
        {hasAccess && (
          <Grid item xs={12} sm={12}>
            <Card>
              <CardHeader title={"Holidays"}/>
              <CardContent>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <DashboardLeaveDayTable/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DashboardLeaveDayChart/>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
