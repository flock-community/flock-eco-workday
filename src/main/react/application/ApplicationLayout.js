import React, {useState} from "react"

import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import IconButton from "@material-ui/core/IconButton"

import MenuIcon from "@material-ui/icons/Menu"
import AccountCircle from "@material-ui/icons/AccountCircle"
import Menu from "@material-ui/core/Menu"
import Typography from "@material-ui/core/Typography"
import MenuItem from "@material-ui/core/MenuItem"
import makeStyles from "@material-ui/core/styles/makeStyles"
import {PropTypes} from "@material-ui/core"

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
})

export function ApplicationLayout({open, onDrawer}) {
  const classes = useStyles()

  const [state, setState] = useState({
    anchorEl: null,
  })

  const handleMenu = event => {
    setState({anchorEl: event.currentTarget})
  }

  const handleClose = () => {
    setState({anchorEl: null})
  }

  const handleLogout = () => {
    window.location.href = "/logout"
  }

  const handleClickDrawer = () => {
    if (onDrawer) {
      onDrawer()
    }
  }

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={handleClickDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            Flock.
          </Typography>

          <div>
            <IconButton
              aria-owns={open ? "menu-appbar" : undefined}
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={state.anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={state.anchorEl != null}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  )
}
ApplicationLayout.propTypes = {
  open: PropTypes.boolean,
  onDrawer: PropTypes.func,
}
