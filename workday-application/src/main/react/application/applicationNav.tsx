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
import ExpensesIcon from '@mui/icons-material/Payments';
import UserIcon from '@mui/icons-material/Person';
import BudgetIcon from '@mui/icons-material/Savings';
import MonthIcon from '@mui/icons-material/Schedule';
import HolidayIcon from '@mui/icons-material/WbSunny';
import WorkdayIcon from '@mui/icons-material/Work';
import type { SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';

type NavIcon = OverridableComponent<SvgIconTypeMap>;

export type NavLeaf = {
  name: string;
  icon: NavIcon;
  url: string;
  authority?: string;
};

export type NavFolder = {
  name: string;
  icon: NavIcon;
  authority?: string;
  items: NavLeaf[];
};

export type NavEntry = NavLeaf | NavFolder;

export type NavSection = {
  header?: string;
  items: NavEntry[];
};

export const isFolder = (entry: NavEntry): entry is NavFolder =>
  'items' in entry;

// Shared by the desktop rail and the mobile drawer so the two never drift.
export const navSections: NavSection[] = [
  {
    items: [
      { name: 'Home', icon: HomeIcon, url: '/' },
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
      { name: 'Budget', icon: BudgetIcon, url: '/budget' },
    ],
  },
  {
    header: 'Time & expenses',
    items: [
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
        name: 'Sickdays',
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
        name: 'Events',
        icon: EventIcon,
        url: '/event',
        authority: 'EventAuthority.READ',
      },
    ],
  },
  {
    header: 'Clients & work',
    items: [
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
    ],
  },
  {
    header: 'People & insight',
    items: [
      {
        name: 'Persons',
        icon: UserIcon,
        url: '/person',
        authority: 'PersonAuthority.READ',
      },
      {
        name: 'Users',
        icon: UserIcon,
        url: '/users',
        authority: 'UserAuthority.READ',
      },
      {
        name: 'Dashboard',
        icon: DashboardIcon,
        url: '/dashboard',
        authority: 'AggregationAuthority.READ',
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
    ],
  },
];

export function isActive(pathname: string, url: string) {
  if (url === '/') return pathname === '/';
  return pathname === url || pathname.startsWith(`${url}/`);
}

const hasAuthority = (authorities: string[], authority?: string) =>
  authority === undefined || authorities.includes(authority);

export function visibleSections(authorities: string[] = []): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items
        .map((entry) => {
          if (isFolder(entry)) {
            const items = entry.items.filter((sub) =>
              hasAuthority(authorities, sub.authority),
            );
            return hasAuthority(authorities, entry.authority) && items.length
              ? { ...entry, items }
              : null;
          }
          return hasAuthority(authorities, entry.authority) ? entry : null;
        })
        .filter((entry): entry is NavEntry => entry !== null),
    }))
    .filter((section) => section.items.length > 0);
}
