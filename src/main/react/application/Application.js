import React, { useEffect, useState } from "react";

import { BrowserRouter as Router, Route } from "react-router-dom";
import { UserFeature } from "@flock-community/flock-eco-feature-user/src/main/react/user/UserFeature";
import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { HolidayFeature } from "../features/holiday/HolidayFeature";
import { ApplicationLayout } from "./ApplicationLayout";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { ApplicationContext } from "./ApplicationContext";
import { HomeFeature } from "../features/home/HomeFeature";
import { ClientFeature } from "../features/client/ClientFeature";
import { AssignmentFeature } from "../features/assignments/AssignmentFeature";
import { PersonFeature } from "../features/person";
import { SickDayFeature } from "../features/sickday/SickDayFeature";
import { useUserMe } from "../hooks/UserMeHook";
import { DashboardFeature } from "../features/dashboard/DashboardFeature";
import { ContractFeature } from "../features/contract/ContractFeature";
import { WorkDayFeature } from "../features/workday/WorkDayFeature.tsx";
import { MonthFeature } from "../features/month/MonthFeature";
import { EventFeature } from "../features/event/EventFeature";
import { EventRatingFeature } from "../features/event_rating/EventRatingFeature";
import { useLoginStatus } from "../hooks/StatusHook";
import { getTheme } from "../theme/theme";
import { ExpenseFeature } from "../features/expense/ExpenseFeature";
import { ExactonlineFeature } from "../features/exactonline/ExactonlineFeature";
import { TodoFeature } from "../features/todo/TodoFeature";

const useStyles = makeStyles(() => ({
  spinner: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

const theme = getTheme("light");

const unauthorizedRoutes = [/^#\/event_rating\/.*/];

export const Application = () => {
  const classes = useStyles();

  const status = useLoginStatus();
  const user = useUserMe();
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
    return (
      <div className={classes.spinner}>
        <CircularProgress />
      </div>
    );
  }

  const authorize = !unauthorizedRoutes.find(it =>
    it.exec(window.location.hash)
  );

  if (authorize && !status.loggedIn) {
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
          <Route path="/" exact component={HomeFeature} />
          <Route path="/dashboard" exact component={DashboardFeature} />
          <Route path="/month" exact component={MonthFeature} />
          <Route path="/todo" exact component={TodoFeature} />
          <Route path="/clients" exact component={ClientFeature} />
          <Route path="/contracts" exact component={ContractFeature} />
          <Route path="/assignments" exact component={AssignmentFeature} />
          <Route path="/workdays" exact component={WorkDayFeature} />
          <Route path="/holidays" exact component={HolidayFeature} />
          <Route path="/sickdays" component={SickDayFeature} />
          <Route path="/expenses" component={ExpenseFeature} />
          <Route path="/exactonline" component={ExactonlineFeature} />
          <Route path="/users" exact component={UserFeature} />
          <Route path="/person" component={PersonFeature} />
          <Route path="/event" component={EventFeature} />
          <Route
            path="/event_rating/:eventCode"
            component={EventRatingFeature}
          />
        </Router>
      </ApplicationContext.Provider>
    </ThemeProvider>
  );
};
