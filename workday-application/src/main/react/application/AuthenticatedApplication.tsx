import React, { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { ApplicationDrawer } from "./ApplicationDrawer";
import { ApplicationLayout } from "./ApplicationLayout";
import { HomeFeature } from "../features/home/HomeFeature";
import { DashboardFeature } from "../features/dashboard/DashboardFeature";
import { MonthFeature } from "../features/month/MonthFeature";
import { TodoFeature } from "../features/todo/TodoFeature";
import { ClientFeature } from "../features/client/ClientFeature";
import ContractPage from "../features/contract/ContractPage";
import { ProjectFeature } from "../features/project/ProjectFeature";
import AssignmentPage from "../features/assignments/AssignmentPage";
import WorkDayPage from "../features/workday/WorkDayPage";
import LeaveDayPage from "../features/holiday/LeaveDayPage";
import SickDayPage from "../features/sickday/SickDayPage";
import ExpensePage from "../features/expense/ExpensePage";
import { ExactonlineFeature } from "../features/exactonline/ExactonlineFeature";
import { UserFeature } from "@workday-user";
import { PersonFeature } from "../features/person/PersonFeature";
import { EventFeature } from "../features/event/EventFeature";
import { EventRatingFeature } from "../features/event_rating/EventRatingFeature";
import AssignmentReport from "../features/report/Assignment/AssignmentReport";
import ContractOverview from "../features/report/ContractOverview/ContractOverview";
import AssignmentOverview from "../features/report/AssignmentOverview/AssignmentOverview";

export const AuthenticatedApplication = () => {
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
