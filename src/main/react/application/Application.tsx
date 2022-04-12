import React, { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import { UserFeature } from "@flock-community/flock-eco-feature-user/src/main/react/user/UserFeature";
import { Box } from "@material-ui/core";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { ApplicationLayout } from "./ApplicationLayout";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { ApplicationContext } from "./ApplicationContext";
import { HomeFeature } from "../features/home/HomeFeature";
import { ClientFeature } from "../features/client/ClientFeature";
import { PersonFeature } from "../features/person/PersonFeature";
import { useUserMe } from "../hooks/UserMeHook";
import { DashboardFeature } from "../features/dashboard/DashboardFeature";
import { MonthFeature } from "../features/month/MonthFeature";
import { EventFeature } from "../features/event/EventFeature";
import { EventRatingFeature } from "../features/event_rating/EventRatingFeature";
import { useLoginStatus } from "../hooks/StatusHook";
import { getTheme } from "../theme/theme";
import { ExactonlineFeature } from "../features/exactonline/ExactonlineFeature";
import { TodoFeature } from "../features/todo/TodoFeature";
import { useError } from "../hooks/ErrorHook";
import { ErrorStack } from "../components/error/ErrorBarStack";
import { ProjectFeature } from "../features/project/ProjectFeature";
import ContractPage from "../features/contract/ContractPage";
import AssignmentPage from "../features/assignments/AssignmentPage";
import HolidayPage from "../features/holiday/HolidayPage";
import ExpensePage from "../features/expense/ExpensePage";
import WorkDayPage from "../features/workday/WorkDayPage";
import SickDayPage from "../features/sickday/SickDayPage";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";

const theme = getTheme("light");

const unauthorizedRoutes = [/^#\/event_rating\/.*/];

export const Application = () => {
  const status = useLoginStatus();
  const user = useUserMe();
  const errors = useError();
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    if (status) {
      UserAuthorityUtil.setAuthorities(status.authorities);
    }
  }, [status]);

  function handleDrawerClose() {
    setOpenDrawer(false);
  }

  function handleDrawerOpen() {
    setOpenDrawer(true);
  }

  if (!status) {
    return <AlignedLoader />;
  }

  const authorize = !unauthorizedRoutes.find((it) =>
    it.exec(window.location.hash)
  );

  if (authorize && !status.isLoggedIn) {
    window.location.href = "/login";
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <ApplicationContext.Provider
        value={{ authorities: status.authorities, user }}
      >
        <Router>
          <ApplicationDrawer open={openDrawer} onClose={handleDrawerClose} />
          <ApplicationLayout onDrawer={handleDrawerOpen} />
          <Box m={2}>
            <Switch>
              <Route path="/" exact component={HomeFeature} />
              <Route path="/dashboard" exact component={DashboardFeature} />
              <Route path="/month" exact component={MonthFeature} />
              <Route path="/todo" exact component={TodoFeature} />
              <Route path="/clients" exact component={ClientFeature} />
              <Route path="/contracts" exact component={ContractPage} />
              <Route path="/projects" exact component={ProjectFeature} />
              <Route path="/assignments" exact component={AssignmentPage} />
              <Route path="/workdays" exact component={WorkDayPage} />
              <Route path="/holidays" exact component={HolidayPage} />
              <Route path="/sickdays" component={SickDayPage} />
              <Route path="/expenses" component={ExpensePage} />
              <Route path="/exactonline" component={ExactonlineFeature} />
              <Route path="/users" exact component={UserFeature} />
              <Route path="/person" component={PersonFeature} />
              <Route path="/event" component={EventFeature} />
              <Route
                path="/event_rating/:eventCode"
                component={EventRatingFeature}
              />
              <Redirect to="/" />
            </Switch>
          </Box>
        </Router>
        <ErrorStack ErrorList={errors} />
      </ApplicationContext.Provider>
    </ThemeProvider>
  );
};
