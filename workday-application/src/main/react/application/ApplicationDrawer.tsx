import ExactonlineIcon from '@mui/icons-material/AccountBalance';
import ProjectIcon from '@mui/icons-material/AccountTree';
import ReportIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TodoIcon from '@mui/icons-material/AssignmentTurnedIn';
import ClientIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/CalendarToday';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ContractIcon from '@mui/icons-material/Description';
import HealingIcon from '@mui/icons-material/Healing';
import HomeIcon from '@mui/icons-material/Home';
import ExpensesIcon from '@mui/icons-material/Money';
import UserIcon from '@mui/icons-material/Person';
import MonthIcon from '@mui/icons-material/Schedule';
import HolidayIcon from '@mui/icons-material/WbSunny';
import WorkdayIcon from '@mui/icons-material/Work';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import { useUserMe } from '../hooks/UserMeHook';
import ApplicationMenuItem from './ApplicationMenuItem';

const PREFIX = 'ApplicationDrawer';

const classes = {
  head: `${PREFIX}Head`,
  list: `${PREFIX}List`,
  fullList: `${PREFIX}FullList`,
};

const StyledDrawer = styled(Drawer)({
  [`& .${classes.head}`]: {
    height: 60,
  },
  [`& .${classes.list}`]: {
    width: 250,
  },
  [`& .${classes.fullList}`]: {
    width: 'auto',
  },
});

type ApplicationDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function ApplicationDrawer({ open, onClose }: ApplicationDrawerProps) {
  const [user] = useUserMe();

  const handleClose = () => onClose?.();

  const items = [
    {
      name: 'Home',
      icon: HomeIcon,
      url: '/',
    },
    {
      name: 'Dashboard',
      icon: DashboardIcon,
      url: '/dashboard',
      authority: 'AggregationAuthority.READ',
    },
    {
      name: 'Month',
      icon: MonthIcon,
      url: '/month',
      authority: 'AggregationAuthority.READ',
    },
    {
      name: 'Todo',
      icon: TodoIcon,
      url: '/todo',
      authority: 'TodoAuthority.READ',
    },
    {
      name: 'Clients',
      icon: ClientIcon,
      url: '/clients',
      authority: 'ClientAuthority.READ',
    },
    {
      name: 'Projects',
      icon: ProjectIcon,
      url: '/projects',
      authority: 'ProjectAuthority.READ',
    },
    {
      name: 'Assignments',
      icon: AssignmentIcon,
      url: '/assignments',
      authority: 'AssignmentAuthority.READ',
    },
    {
      name: 'Contracts',
      icon: ContractIcon,
      url: '/contracts',
      authority: 'ContractAuthority.READ',
    },
    {
      name: 'Workdays',
      icon: WorkdayIcon,
      url: '/workdays',
      authority: 'WorkDayAuthority.READ',
    },
    {
      name: 'Leave days',
      icon: HolidayIcon,
      url: '/leave-days',
      authority: 'LeaveDayAuthority.READ',
    },
    {
      name: 'Sickday',
      icon: HealingIcon,
      url: '/sickdays',
      authority: 'SickdayAuthority.READ',
    },
    {
      name: 'Expenses',
      icon: ExpensesIcon,
      url: '/expenses',
      authority: 'ExpenseAuthority.READ',
    },
    {
      name: 'Exact online',
      icon: ExactonlineIcon,
      url: '/exactonline',
      authority: 'ExactonlineAuthority.READ',
    },
    {
      name: 'Events',
      icon: EventIcon,
      url: '/event',
      authority: 'EventAuthority.READ',
    },
    {
      name: 'Users',
      icon: UserIcon,
      url: '/users',
      authority: 'UserAuthority.READ',
    },
    {
      name: 'Persons',
      icon: UserIcon,
      url: '/person',
      authority: 'PersonAuthority.READ',
    },
    {
      name: 'Reports',
      icon: ReportIcon,
      authority: 'AggregationAuthority.READ',
      items: [
        {
          name: 'Active Contracts',
          icon: ContractIcon,
          url: '/reports/contract-overview',
        },
        {
          name: 'Active Assignments',
          icon: AssignmentIcon,
          url: '/reports/assignment-overview',
        },
        {
          name: 'Assignment hours',
          icon: AssignmentOutlinedIcon,
          url: '/reports/assignment',
        },
      ],
    },
  ];

  const sideList = () => (
    <Box className={classes.list} role="presentation" onKeyDown={handleClose}>
      <List>
        {items
          .filter(
            (item) =>
              item.authority === undefined ||
              user.authorities.includes(item.authority),
          )
          .map((item) => (
            <ApplicationMenuItem
              key={item.name}
              item={item}
              handleClose={handleClose}
            />
          ))}
      </List>
    </Box>
  );

  if (!user) {
    return null;
  }

  return (
    <StyledDrawer open={open} onClose={handleClose}>
      <div className={classes.head} />
      {sideList()}
    </StyledDrawer>
  );
}
