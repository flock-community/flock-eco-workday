import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Link } from '@mui/material';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { FlockBird } from '../components/FlockBird';
// Hooks
import { useSession } from '../hooks/SessionHook';
import { ColorModeToggle } from '../theme/ColorModeToggle';

const PREFIX = 'ApplicationLayout';

const classes = {
  root: `${PREFIX}Root`,
  grow: `${PREFIX}grow`,
  menuButton: `${PREFIX}menuButton`,
  navBar: `${PREFIX}NavBar`,
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
    position: 'sticky',
  },
});

type ApplicationLayoutProps = {
  onDrawer: () => void;
};

export function ApplicationLayout({ onDrawer }: ApplicationLayoutProps) {
  const handleLogout = () => {
    window.location.href = '/logout';
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
    <Root className="full-width">
      <AppBar className={classes.navBar}>
        <Toolbar
          sx={{
            width: '100%',
            maxWidth: 'var(--content-max-width)',
            mx: 'auto',
          }}
        >
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
            color="inherit"
            className={classes.grow}
            underline="none"
            component={RouterLink}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '1.2rem',
              letterSpacing: '-0.01em',
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                color: (t) =>
                  t.palette.mode === 'dark' ? 'primary.main' : 'inherit',
              }}
            >
              <FlockBird
                style={{ height: '1.9rem', width: 'auto', display: 'block' }}
              />
            </Box>
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '0.3rem',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: (t) =>
                    t.palette.mode === 'dark' ? 'primary.main' : 'inherit',
                }}
              >
                Flock.
              </Box>{' '}
              <Box component="span" sx={{ fontWeight: 400, opacity: 0.85 }}>
                Workday
              </Box>
            </Box>
          </Link>

          <ColorModeToggle edge={false} sx={{ mr: 0.5 }} />

          <div>
            <IconButton
              aria-owns={state.anchorEl != null ? 'menu-appbar' : undefined}
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
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={state.anchorEl != null}
              onClose={handleClose}
            >
              <MenuItem
                onClick={handleClose}
                component={RouterLink}
                to="/profile"
              >
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
          Quick heads up: your session's almost up. Extend it to stick around,
          or log back in.
        </Alert>
      </Snackbar>
    </Root>
  );
}
