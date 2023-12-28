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
import { HomeFeature } from "../features/home/HomeFeature";
import { ClientFeature } from "../features/client/ClientFeature";
import { PersonFeature } from "../features/person/PersonFeature";
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
import LeaveDayPage from "../features/holiday/LeaveDayPage";
import ExpensePage from "../features/expense/ExpensePage";
import WorkDayPage from "../features/workday/WorkDayPage";
import SickDayPage from "../features/sickday/SickDayPage";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import AssignmentReport from "../features/report/Assignment/AssignmentReport";
import ContractOverview from "../features/report/ContractOverview/ContractOverview";
import AssignmentOverview from "../features/report/AssignmentOverview/AssignmentOverview";
import { LoginFeature } from "../features/login/LoginFeature";

const theme = getTheme("light");

export const Application = () => {
  const status = useLoginStatus();
  const errors = useError();

  useEffect(() => {
    if (status) {
      UserAuthorityUtil.setAuthorities(status.authorities);
    } else {
      UserAuthorityUtil.setAuthorities([]);
    }
  }, [status]);

  if (status == null) {
    return <AlignedLoader/>;
  }

  return (
    <Router>
      <ThemeProvider theme={theme}>
        {status.isLoggedIn ? (
          <RenderAuthenticated />
        ) : (
          <RenderUnauthenticated />
        )}
        <ErrorStack ErrorList={errors} />
      </ThemeProvider>
    </Router>
  );
};

const RenderAuthenticated = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <>
      <ApplicationDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
      <ApplicationLayout onDrawer={() => setOpenDrawer(true)} />
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
        <Route path="/leave-days" exact component={LeaveDayPage} />
        <Route path="/sickdays" component={SickDayPage} />
        <Route path="/expenses" component={ExpensePage} />
        <Route path="/exactonline" component={ExactonlineFeature} />
        <Route path="/users" exact component={UserFeature} />
        <Route path="/person" component={PersonFeature} />
        <Route path="/event" component={EventFeature} />
        <Route path="/event_rating/:eventCode" component={EventRatingFeature} />
        <Route path="/reports/assignment" component={AssignmentReport} />
        <Route path="/reports/contract-overview" component={ContractOverview} />
        <Route
          path="/reports/assignment-overview"
          component={AssignmentOverview}
        />
        <Redirect to="/" />
      </Switch>
    </>
  );
};

const RenderUnauthenticated = () => {
  return <>
    <Box className={'full-width'} style={{'--row-gap': 0}}>
      <Redirect to="/auth" exact/>
      <Route path="/auth" exact component={LoginFeature}/>
    </Box>
  </>
};
