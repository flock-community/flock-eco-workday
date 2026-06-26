import useMediaQuery from '@mui/material/useMediaQuery';
import { UserFeature } from '@workday-user';
import { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import AssignmentPage from '../features/assignments/AssignmentPage';
import BudgetPage from '../features/budget/BudgetPage';
import { ClientFeature } from '../features/client/ClientFeature';
import ContractPage from '../features/contract/ContractPage';
import { DashboardFeature } from '../features/dashboard/DashboardFeature';
import { EventFeature } from '../features/event/EventFeature';
import { EventRatingFeature } from '../features/event_rating/EventRatingFeature';
import ExpensePage from '../features/expense/ExpensePage';
import LeaveDayPage from '../features/holiday/LeaveDayPage';
import { HomeFeature } from '../features/home/HomeFeature';
import { MonthFeature } from '../features/month/MonthFeature';
import { PersonFeature } from '../features/person/PersonFeature';
import { ProfileFeature } from '../features/profile/ProfileFeature';
import { ProjectFeature } from '../features/project/ProjectFeature';
import AssignmentReport from '../features/report/Assignment/AssignmentReport';
import AssignmentOverview from '../features/report/AssignmentOverview/AssignmentOverview';
import ContractOverview from '../features/report/ContractOverview/ContractOverview';
import SickDayPage from '../features/sickday/SickDayPage';
import { TodoFeature } from '../features/todo/TodoFeature';
import WorkDayPage from '../features/workday/WorkDayPage';
import { ApplicationDrawer } from './ApplicationDrawer';
import { ApplicationLayout } from './ApplicationLayout';
import { ApplicationSidebar } from './ApplicationSidebar';

const SIDEBAR_KEY = 'flock.sidebarOpen';

export const AuthenticatedApplication = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => localStorage.getItem(SIDEBAR_KEY) !== 'false',
  );
  const isDesktop = useMediaQuery('(min-width:900px)');

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
    const grid = document.getElementById('index');
    if (!grid) return;
    grid.classList.toggle('has-sidebar', sidebarOpen);
    return () => grid.classList.remove('has-sidebar');
  }, [sidebarOpen]);

  const handleMenu = () =>
    isDesktop ? setSidebarOpen((o) => !o) : setOpenDrawer(true);

  return (
    <>
      <ApplicationSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <ApplicationDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
      <ApplicationLayout onMenu={handleMenu} />
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
        <Route path="/users" exact component={UserFeature} />
        <Route path="/person" component={PersonFeature} />
        <Route path="/profile" component={ProfileFeature} />
        <Route path="/event" component={EventFeature} />
        <Route path="/budget" component={BudgetPage} />
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
