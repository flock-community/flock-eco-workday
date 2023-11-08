import React, {useEffect, useState} from "react";
import Typography from "@material-ui/core/Typography";
import {useUserMe} from "../../hooks/UserMeHook";
import {DashboardHoursChart} from "../../components/charts/DashboardHoursChart";
import {DashboardLeaveDayTable} from "../../components/tables/DashboardLeaveDayTable";
import {Box, Card, CardContent, CardHeader, Container, Grid} from "@material-ui/core";
import ContractsEnding from "../../components/contracts/ContractsEnding";
import PersonEvents from "../../components/person/PersonEvents";
import {DashboardLeaveDayChart} from "../../components/charts/DashboardLeaveDayChart";
import {highLightClass} from "../../theme/theme-light";
import {QuickLinks} from "../../components/quick-links/QuickLinks";
import {MissingHoursCard} from "../../components/missing-hours-card/MissingHoursCard";
import { ContractClient } from "../../clients/ContractClient";
import dayjs from "dayjs";
import {PersonEvent, PersonEventClient} from "../../clients/PersonEventClient";

export function HomeFeature() {
  const [ user ] = useUserMe();
  const [ withinNWeek ] = useState<number>(6);
  const [contracts, setContracts] = useState<any[]>([]);
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);

  const hasAccess = user?.authorities?.length > 0;

  const showContractsEnding =
    user?.authorities?.includes("ContractAuthority.ADMIN") ?? false;

  const showPersonEvents =
    user?.authorities?.includes("PersonAuthority.READ") ?? false;

  const classes = highLightClass();
  const layout = layoutClasses();

  useEffect(() => {
    const today: Date = new Date();
    const nWeeksFromNow: Date = dayjs().add(withinNWeek, "weeks").toDate();
    ContractClient.findAllByToBetween(today, nWeeksFromNow).then((contracts) => setContracts(contracts));
    PersonEventClient.findAllBetween(today, nWeeksFromNow).then((personEvents) => setPersonEvents(personEvents));
  }, []);

  return (
    <Container>
      <Grid container spacing={6} style={{ marginTop: '24px' }}>
        <Grid item xs={12}>
          <Box style={{ paddingInline: "16px" }}>
            <Typography variant="h2">Hi, <span className={classes.highlight}>{user && user.name}</span>!</Typography>
          </Box>
        </Grid>
        {!hasAccess && (
          <Grid item xs={12}>
            <Typography>No roles are assigned to your account.</Typography>
          </Grid>
        )}
        {showContractsEnding && (
          <Grid item xs={12}>
            <ContractsEnding withinNWeeks={withinNWeek} contracts={contracts} />
          </Grid>
        )}
        {showPersonEvents && (
          <Grid item xs={12}>
            <PersonEvents withinNWeeks={withinNWeek} personEvents={personEvents} />
          </Grid>
        )}
        {hasAccess && (
          <Grid item xs={12}>
            <QuickLinks />
          </Grid>
        )}
        {hasAccess && (
          <Grid item xs={12}>
            <Grid item xs={12} md={6}>
              <MissingHoursCard />
            </Grid>
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
