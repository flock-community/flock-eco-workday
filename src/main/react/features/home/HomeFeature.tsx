import React from "react";
import Typography from "@material-ui/core/Typography";
import { useUserMe } from "../../hooks/UserMeHook";
import { DashboardHoursChart } from "../../components/charts/DashboardHoursChart";
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
} from "@material-ui/core";
import { DashboardHolidayTable } from "../../components/tables/DashboardHolidayTable";
import ContractsEnding from "../../components/contracts/ContractsEnding";
import PersonEvents from "../../components/person/PersonEvents";
import { DashboardHolidayChart } from "../../components/charts/DashboardHolidayChart";

export function HomeFeature() {
  const user = useUserMe();

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
        {showContractsEnding && (
          <Grid item xs={12}>
            <ContractsEnding withinNWeeks={6} />
          </Grid>
        )}
        {showPersonEvents && (
          <Grid item xs={12}>
            <PersonEvents withinNWeeks={6} />
          </Grid>
        )}
        <Grid item xs={12}>
          <Card style={{ overflow: "visible" }}>
            <CardHeader title={"Workdays"} />
            <CardContent>
              <DashboardHoursChart />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Card>
            <CardHeader title={"Holidays"} />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <DashboardHolidayTable />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DashboardHolidayChart />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
