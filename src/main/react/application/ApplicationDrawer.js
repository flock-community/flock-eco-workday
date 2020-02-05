import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import React from "react"
import ListItemText from "@material-ui/core/ListItemText"
import ListItemIcon from "@material-ui/core/ListItemIcon"

import AssignmentIcon from "@material-ui/icons/Assignment"
import HolidayIcon from "@material-ui/icons/WbSunny"
import HealingIcon from "@material-ui/icons/Healing"
import EventIcon from "@material-ui/icons/CalendarToday"
import UserIcon from "@material-ui/icons/Person"
import ClientIcon from "@material-ui/icons/Business"
import DashboardIcon from "@material-ui/icons/Dashboard"

import Drawer from "@material-ui/core/Drawer"
import makeStyles from "@material-ui/core/styles/makeStyles"
import {withRouter} from "react-router-dom"
import {useUser} from "../hooks/UserHook"

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

export const ApplicationDrawer = withRouter(({open, onClose, history}) => {
  const classes = useStyles()

  const [user] = useUser()

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
      authority: "DashboardAuthority.READ",
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
      name: "Events",
      icon: EventIcon,
      url: "/events",
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
})
