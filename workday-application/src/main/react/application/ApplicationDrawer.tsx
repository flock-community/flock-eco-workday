import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useUserMe } from '../hooks/UserMeHook';
import { ColorModeToggle } from '../theme/ColorModeToggle';
import ApplicationMenuItem from './ApplicationMenuItem';
import { visibleSections } from './applicationNav';

const PREFIX = 'ApplicationDrawer';

const classes = {
  head: `${PREFIX}Head`,
  list: `${PREFIX}List`,
};

const DRAWER_WIDTH = 264;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  [`& .${classes.head}`]: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.3rem',
    padding: theme.spacing(2.5, 2.5, 2),
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.primary.main,
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.text.primary
        : theme.palette.primary.contrastText,
  },
  [`& .${classes.list}`]: {
    width: DRAWER_WIDTH,
    paddingBlock: theme.spacing(1),
  },
}));

type ApplicationDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function ApplicationDrawer({ open, onClose }: ApplicationDrawerProps) {
  const [user] = useUserMe();

  const handleClose = () => onClose?.();

  if (!user) {
    return null;
  }

  return (
    <StyledDrawer open={open} onClose={handleClose}>
      <Box className={classes.head}>
        <Typography
          component="span"
          sx={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: (t) =>
              t.palette.mode === 'dark' ? 'primary.main' : 'inherit',
          }}
        >
          Flock.
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: '1.25rem', fontWeight: 400, opacity: 0.85 }}
        >
          Workday
        </Typography>
        <ColorModeToggle
          color="inherit"
          size="small"
          sx={{ ml: 'auto', alignSelf: 'center', opacity: 0.7, '&:hover': { opacity: 1 } }}
        />
      </Box>
      <Divider />
      <Box className={classes.list} role="presentation" onKeyDown={handleClose}>
        {visibleSections(user.authorities).map((section, i) => (
          <List
            key={section.header ?? `primary-${i}`}
            subheader={
              section.header ? (
                <ListSubheader disableSticky>{section.header}</ListSubheader>
              ) : undefined
            }
          >
            {section.items.map((item) => (
              <ApplicationMenuItem
                key={item.name}
                item={item}
                handleClose={handleClose}
              />
            ))}
          </List>
        ))}
      </Box>
    </StyledDrawer>
  );
}
