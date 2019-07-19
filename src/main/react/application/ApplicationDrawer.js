import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import React from "react";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

import HolidayIcon from '@material-ui/icons/WbSunny';
import EventIcon from '@material-ui/icons/CalendarToday';
import UserIcon from '@material-ui/icons/Person';

import Drawer from "@material-ui/core/Drawer";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
  head:{
    height: 60
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

export default function ApplicationDrawer({open, onClickItem, onClose}) {

  const classes = useStyles();

  const handleClose = event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    onClose && onClose()
  };

  const handleClickItem = () => {
    onClickItem && onClickItem()
  }

  const items = [
    {
      name: "Holidays",
      icon: HolidayIcon,
      url: "holidays"
    },
    {
      name: "Events",
      icon: EventIcon,
      url: "events"
    },
    {
      name: "User",
      icon: UserIcon,
      url: "events"
    }
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
          .map(item => (<ListItem button key={`menu-item-${item.name}`} onClick={handleClickItem}>
            <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
            <ListItemText primary={item.name}/>
          </ListItem>))
        }

      </List>
    </div>
  );
  return (<Drawer open={open} onClose={handleClose}>
    <div className={classes.head}/>
    {sideList()}
  </Drawer>)
}
