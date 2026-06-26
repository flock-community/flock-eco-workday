import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ProfileIcon from '@mui/icons-material/Person';
import { Avatar, Box, Collapse, Typography } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import { createElement, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useUserMe } from '../hooks/UserMeHook';
import {
  isActive,
  isFolder,
  type NavFolder,
  type NavLeaf,
  visibleSections,
} from './applicationNav';

function initials(name?: string) {
  if (!name) return '?';
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

const label = (sx?: object) => ({
  flex: 1,
  minWidth: 0,
  textAlign: 'left' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
  ...sx,
});

function navSx(active: boolean, depth = 0) {
  return {
    justifyContent: 'flex-start',
    gap: 1.25,
    width: '100%',
    py: 1,
    pr: 1.5,
    pl: depth ? 4.5 : 1.5,
    borderRadius: 2,
    fontSize: depth ? 13 : 14,
    fontWeight: active ? 600 : 500,
    color: active ? 'primary.contrastText' : 'text.secondary',
    bgcolor: active ? 'primary.main' : 'transparent',
    '& .MuiSvgIcon-root': { fontSize: depth ? 18 : 20 },
    '&:hover': {
      bgcolor: active ? 'primary.main' : 'action.hover',
      color: active ? 'primary.contrastText' : 'text.primary',
    },
  };
}

function NavItem({ item, depth = 0 }: { item: NavLeaf; depth?: number }) {
  const { pathname } = useLocation();
  const active = isActive(pathname, item.url);
  return (
    <ButtonBase component={RouterLink} to={item.url} sx={navSx(active, depth)}>
      {createElement(item.icon)}
      <Box component="span" sx={label()}>
        {item.name}
      </Box>
    </ButtonBase>
  );
}

function NavFolderItem({ folder }: { folder: NavFolder }) {
  const { pathname } = useLocation();
  const childActive = folder.items.some((sub) => isActive(pathname, sub.url));
  const [open, setOpen] = useState(childActive);
  return (
    <>
      <ButtonBase onClick={() => setOpen((o) => !o)} sx={navSx(false)}>
        {createElement(folder.icon)}
        <Box component="span" sx={label()}>
          {folder.name}
        </Box>
        {open ? <ExpandLess /> : <ExpandMore />}
      </ButtonBase>
      <Collapse in={open} timeout={150} unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {folder.items.map((sub) => (
            <NavItem key={sub.name} item={sub} depth={1} />
          ))}
        </Box>
      </Collapse>
    </>
  );
}

export function ApplicationSidebar() {
  const [user] = useUserMe();
  if (!user) return null;

  const authorities = user.authorities ?? [];
  const role = authorities.includes('UserAuthority.READ') ? 'admin' : 'member';

  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        gap: 0.25,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        px: 1,
        py: 2,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
        zIndex: (t: Theme) => t.zIndex.appBar - 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1,
          pt: 0.5,
          pb: 2,
          mb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            fontSize: 14,
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {initials(user.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={label({ fontSize: 14, fontWeight: 600 })}>
            {user.name ?? 'Unknown'}
          </Typography>
          <Typography sx={label({ fontSize: 12, color: 'text.secondary' })}>
            Flock · {role}
          </Typography>
        </Box>
      </Box>

      {visibleSections(authorities).map((section, i) => (
        <Box
          key={section.header ?? `primary-${i}`}
          sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}
        >
          {section.header && (
            <Typography
              sx={{
                px: 1.5,
                pt: 1.5,
                pb: 0.5,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'text.disabled',
                lineHeight: 1,
              }}
            >
              {section.header}
            </Typography>
          )}
          {section.items.map((entry) =>
            isFolder(entry) ? (
              <NavFolderItem key={entry.name} folder={entry} />
            ) : (
              <NavItem key={entry.name} item={entry} />
            ),
          )}
        </Box>
      ))}

      <Box sx={{ flex: 1 }} />
      <NavItem item={{ name: 'Profile', icon: ProfileIcon, url: '/profile' }} />
    </Box>
  );
}
