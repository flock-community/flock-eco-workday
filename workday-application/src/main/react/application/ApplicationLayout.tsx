import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/material";

// Hooks
import { useSession } from "../hooks/SessionHook";

const PREFIX = 'ApplicationLayout';

const classes = {
  root: `${PREFIX}-root`,
  grow: `${PREFIX}-grow`,
  menuButton: `${PREFIX}-menuButton`,
  navBar: `${PREFIX}-navBar`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
  [`& .${classes.root}`]: {
    flexGrow: 1,
  },
  [`& .${classes.grow}`]: {
    flexGrow: 1,
  },
  [`& .${classes.menuButton}`]: {
    marginLeft: -12,
    marginRight: 20,
  },
  [`& .${classes.navBar}`]: {
    position: "sticky",
  },
});

type ApplicationLayoutProps = {
  onDrawer: () => void;
};

export function ApplicationLayout({ onDrawer }: ApplicationLayoutProps) {


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
    <Root>
      <AppBar className={classes.navBar + " full-width"}>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
            onClick={handleClickDrawer}
            size="large"
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
              size="large"
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
              <MenuItem onClick={handleClose} disabled>
                Profile
              </MenuItem>
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
    </Root>
  );
}
