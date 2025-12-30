import List from "@mui/material/List";
import React from "react";
import ProjectIcon from "@mui/icons-material/AccountTree";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ContractIcon from "@mui/icons-material/Description";
import HolidayIcon from "@mui/icons-material/WbSunny";
import HealingIcon from "@mui/icons-material/Healing";
import EventIcon from "@mui/icons-material/CalendarToday";
import UserIcon from "@mui/icons-material/Person";
import ClientIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MonthIcon from "@mui/icons-material/Schedule";
import WorkdayIcon from "@mui/icons-material/Work";
import ExpensesIcon from "@mui/icons-material/Money";
import ExactonlineIcon from "@mui/icons-material/AccountBalance";
import TodoIcon from "@mui/icons-material/AssignmentTurnedIn";
import HomeIcon from "@mui/icons-material/Home";
import ReportIcon from "@mui/icons-material/Assessment";

import Drawer from "@mui/material/Drawer";
import makeStyles from "@mui/styles/makeStyles";
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
  const [user] = useUserMe();

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
      authority: "ContractAuthority.READ",
    },
    {
      name: "Workdays",
      icon: WorkdayIcon,
      url: "/workdays",
      authority: "WorkDayAuthority.READ",
    },
    {
      name: "Leave days",
      icon: HolidayIcon,
      url: "/leave-days",
      authority: "LeaveDayAuthority.READ",
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
      name: "Persons",
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
          name: "Active Contracts",
          icon: ContractIcon,
          url: "/reports/contract-overview",
        },
        {
          name: "Active Assignments",
          icon: AssignmentIcon,
          url: "/reports/assignment-overview",
        },
        {
          name: "Assignment hours",
          icon: AssignmentOutlinedIcon,
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
