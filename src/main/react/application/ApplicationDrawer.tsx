import List from "@material-ui/core/List";
import React from "react";
import ProjectIcon from "@material-ui/icons/AccountTree";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ContractIcon from "@material-ui/icons/Description";
import HolidayIcon from "@material-ui/icons/WbSunny";
import HealingIcon from "@material-ui/icons/Healing";
import EventIcon from "@material-ui/icons/CalendarToday";
import UserIcon from "@material-ui/icons/Person";
import ClientIcon from "@material-ui/icons/Business";
import DashboardIcon from "@material-ui/icons/Dashboard";
import MonthIcon from "@material-ui/icons/Schedule";
import WorkdayIcon from "@material-ui/icons/Work";
import ExpensesIcon from "@material-ui/icons/Money";
import ExactonlineIcon from "@material-ui/icons/AccountBalance";
import TodoIcon from "@material-ui/icons/AssignmentTurnedIn";
import HomeIcon from "@material-ui/icons/Home";
import ReportIcon from "@material-ui/icons/Assessment";

import Drawer from "@material-ui/core/Drawer";
import { makeStyles } from "@material-ui/core/styles";
import { useUserMe } from "../hooks/UserMeHook";
import ApplicationMenuItem from "./ApplicationMenuItem";

const useStyles = makeStyles({
  head: {
    height: 60,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
});

type ApplicationDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function ApplicationDrawer({ open, onClose }: ApplicationDrawerProps) {
  const classes = useStyles();
  const user = useUserMe();

  const handleClose = () => onClose?.();

  const items = [
    {
      name: "Home",
      icon: HomeIcon,
      url: "/",
    },
    {
      name: "Dashboard",
      icon: DashboardIcon,
      url: "/dashboard",
      authority: "AggregationAuthority.READ",
    },
    {
      name: "Month",
      icon: MonthIcon,
      url: "/month",
      authority: "AggregationAuthority.READ",
    },
    {
      name: "Todo",
      icon: TodoIcon,
      url: "/todo",
      authority: "TodoAuthority.READ",
    },
    {
      name: "Clients",
      icon: ClientIcon,
      url: "/clients",
      authority: "ClientAuthority.READ",
    },
    {
      name: "Projects",
      icon: ProjectIcon,
      url: "/projects",
      authority: "ProjectAuthority.READ",
    },
    {
      name: "Assignments",
      icon: AssignmentIcon,
      url: "/assignments",
      authority: "AssignmentAuthority.READ",
    },
    {
      name: "Contracts",
      icon: ContractIcon,
      url: "/contracts",
      authority: "AssignmentAuthority.READ",
    },
    {
      name: "Workdays",
      icon: WorkdayIcon,
      url: "/workdays",
      authority: "WorkDayAuthority.READ",
    },
    {
      name: "Holidays",
      icon: HolidayIcon,
      url: "/holidays",
      authority: "HolidayAuthority.READ",
    },
    {
      name: "Sickday",
      icon: HealingIcon,
      url: "/sickdays",
      authority: "SickdayAuthority.READ",
    },
    {
      name: "Expenses",
      icon: ExpensesIcon,
      url: "/expenses",
      authority: "ExpenseAuthority.READ",
    },
    {
      name: "Exact online",
      icon: ExactonlineIcon,
      url: "/exactonline",
      authority: "ExactonlineAuthority.READ",
    },
    {
      name: "Events",
      icon: EventIcon,
      url: "/event",
      authority: "EventAuthority.READ",
    },
    {
      name: "Users",
      icon: UserIcon,
      url: "/users",
      authority: "UserAuthority.READ",
    },
    {
      name: "Person",
      icon: UserIcon,
      url: "/person",
      authority: "PersonAuthority.READ",
    },
    {
      name: "Reports",
      icon: ReportIcon,
      authority: "AggregationAuthority.READ",
      items: [
        {
          name: "Assignment hours",
          icon: AssignmentIcon,
          url: "/reports/assignment",
        },
      ],
    },
  ];

  const sideList = () => (
    <div className={classes.list} role="presentation" onKeyDown={handleClose}>
      <List>
        {items
          .filter(
            (item) =>
              item.authority === undefined ||
              user.authorities.includes(item.authority)
          )
          .map((item) => (
            <ApplicationMenuItem
              key={item.name}
              item={item}
              handleClose={handleClose}
            />
          ))}
      </List>
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <Drawer open={open} onClose={handleClose}>
      <div className={classes.head} />
      {sideList()}
    </Drawer>
  );
}
