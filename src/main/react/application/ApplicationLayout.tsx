import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@material-ui/core";

// Hooks
import { useSession } from "../hooks/SessionHook";

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
  navBar: {
    position: "sticky",
    top: 0,
  },
});

type ApplicationLayoutProps = {
  onDrawer: () => void;
};

export function ApplicationLayout({ onDrawer }: ApplicationLayoutProps) {
  const classes = useStyles();

  const handleLogout = () => {
    window.location.href = "/logout";
  };

  const { extendSession, sessionExpired } = useSession(handleLogout);

  const [state, setState] = useState({
    anchorEl: null,
  });

  const handleMenu = (event) => {
    setState({ anchorEl: event.currentTarget });
  };

  const handleClose = () => {
    setState({ anchorEl: null });
  };

  const handleClickDrawer = () => {
    if (onDrawer) {
      onDrawer();
    }
  };

  return (
    <>
      <AppBar className={classes.navBar}>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={handleClickDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Link
            variant="h6"
            color="inherit"
            className={classes.grow}
            underline="none"
            component={RouterLink}
            to="/"
          >
            Flock. Workday
          </Link>

          <div>
            <IconButton
              aria-owns={state.anchorEl != null ? "menu-appbar" : undefined}
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
      <Snackbar open={sessionExpired} autoHideDuration={6000}>
        <Alert
          severity="error"
          action={
            <Button onClick={extendSession} color="primary" size="small">
              +30minutes
            </Button>
          }
        >
          Extend your session or be redirected you peasant.
        </Alert>
      </Snackbar>
    </>
  );
}
