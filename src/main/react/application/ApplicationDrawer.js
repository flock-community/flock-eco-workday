import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import React from "react"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from "@material-ui/core/ListItemIcon"

import {useHistory} from "react-router-dom"
import AssignmentIcon from "@material-ui/icons/Assignment"
import ContractIcon from "@material-ui/icons/Description"
import HolidayIcon from "@material-ui/icons/WbSunny"
import HealingIcon from "@material-ui/icons/Healing"
import EventIcon from "@material-ui/icons/CalendarToday"
import UserIcon from "@material-ui/icons/Person"
import ClientIcon from "@material-ui/icons/Business"
import DashboardIcon from "@material-ui/icons/Dashboard"
import MonthIcon from "@material-ui/icons/Schedule"
import WorkdayIcon from "@material-ui/icons/Work"
import ExpensesIcon from "@material-ui/icons/Money"
import ExactonlineIcon from "@material-ui/icons/AccountBalance"
import TodoIcon from "@material-ui/icons/AssignmentTurnedIn"

import Drawer from "@material-ui/core/Drawer"
import makeStyles from "@material-ui/core/styles/makeStyles"
import PropTypes from "prop-types"
import {useUserMe} from "../hooks/UserMeHook"

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
})

export function ApplicationDrawer({open, onClose}) {
  const classes = useStyles()
  const history = useHistory()
  const user = useUserMe()

  const handleClose = event => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    if (onClose) {
      onClose()
    }
  }

  const handleClickItem = item => () => {
    history.push(item.url)
  }

  const items = [
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
  ]

  const sideList = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={handleClose}
      onKeyDown={handleClose}
    >
      <List>
        {items
          .filter(item => user.authorities.includes(item.authority))
          .map(item => (
            <ListItem
              button
              key={`menu-item-${item.name}`}
              onClick={handleClickItem(item)}
            >
              <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          ))}
      </List>
    </div>
  )

  if (!user) {
    return null
  }

  return (
    <Drawer open={open} onClose={handleClose}>
      <div className={classes.head} />
      {sideList()}
    </Drawer>
  )
}

ApplicationDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
}
