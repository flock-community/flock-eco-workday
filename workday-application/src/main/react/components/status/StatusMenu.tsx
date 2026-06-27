import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useState } from 'react';
import { brand } from '../../theme/tokens';
import {
  canChangeStatus,
  filterTransitionsFromByStatus,
} from './StatusMethods';

const PREFIX = 'StatusMenu';

const classes = {
  buttonRequested: `${PREFIX}ButtonRequested`,
  buttonApproved: `${PREFIX}ButtonApproved`,
  buttonRejected: `${PREFIX}ButtonRejected`,
  buttonDone: `${PREFIX}ButtonDone`,
};

const Root = styled('div')(({ theme }) => ({
  // Uniform width so every status reads as the same chip regardless of label length.
  '& .MuiButton-root': {
    minWidth: 124,
  },

  [`& .${classes.buttonRequested}`]: {
    backgroundColor: 'transparent',
    color: theme.palette.mode === 'dark' ? brand.cyan : brand.cyanDark,
    outline: `1px solid ${alpha(
      brand.cyan,
      theme.palette.mode === 'dark' ? 0.6 : 0.75,
    )}`,
    '&:hover': {
      backgroundColor: alpha(brand.cyan, 0.1),
    },
    '&.Mui-disabled': {
      backgroundColor: 'transparent',
      color: theme.palette.mode === 'dark' ? brand.cyan : brand.cyanDark,
      outline: `1px solid ${alpha(
        brand.cyan,
        theme.palette.mode === 'dark' ? 0.6 : 0.75,
      )}`,
    },
  },

  [`& .${classes.buttonApproved}`]: {
    backgroundColor: brand.teal,
    color: theme.palette.getContrastText(brand.teal),
    '&:disabled': {
      backgroundColor: brand.teal,
      color: theme.palette.getContrastText(brand.teal),
    },
  },

  [`& .${classes.buttonRejected}`]: {
    backgroundColor: alpha(
      theme.palette.error.main,
      theme.palette.mode === 'dark' ? 0.22 : 0.14,
    ),
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.error.light
        : theme.palette.error.dark,
    outline: `1px solid ${alpha(
      theme.palette.error.main,
      theme.palette.mode === 'dark' ? 0.5 : 0.4,
    )}`,
    '&:hover': {
      backgroundColor: alpha(
        theme.palette.error.main,
        theme.palette.mode === 'dark' ? 0.3 : 0.2,
      ),
    },
    '&:disabled': {
      backgroundColor: alpha(
        theme.palette.error.main,
        theme.palette.mode === 'dark' ? 0.22 : 0.14,
      ),
      color:
        theme.palette.mode === 'dark'
          ? theme.palette.error.light
          : theme.palette.error.dark,
      outline: `1px solid ${alpha(
        theme.palette.error.main,
        theme.palette.mode === 'dark' ? 0.5 : 0.4,
      )}`,
    },
  },

  [`& .${classes.buttonDone}`]: {
    backgroundColor: theme.palette.done,
    color: theme.palette.getContrastText(theme.palette.done),
    '&:disabled': {
      backgroundColor: theme.palette.done,
      color: theme.palette.getContrastText(theme.palette.done),
    },
  },
}));

type StatusMenuProps = {
  onChange: (status: string) => void;
  disabled?: boolean;
  value: string;
};

export function StatusMenu({ onChange, disabled, value }: StatusMenuProps) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [expanded, setIsExpanded] = useState(false);

  const currentStateOptions = filterTransitionsFromByStatus(value);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setIsExpanded(!expanded);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (event) => {
    event.stopPropagation();
    const newValue = event.currentTarget.dataset.value;

    if (canChangeStatus(value, newValue)) {
      onChange(newValue);
      handleClose();
    }
  };

  const renderMenuItem = (item) => {
    return (
      <MenuItem
        key={`status-selector-menu-item-${item}`}
        onClick={handleMenuItemClick}
        data-value={item}
      >
        {item}
      </MenuItem>
    );
  };

  return (
    // @ts-expect-error
    <Root className={classes.status}>
      <Button
        aria-haspopup="true"
        aria-expanded={expanded}
        disabled={disabled}
        onClick={handleMenuClick}
        className={clsx({
          [classes.buttonRequested]: value === 'REQUESTED',
          [classes.buttonApproved]: value === 'APPROVED',
          [classes.buttonRejected]: value === 'REJECTED',
          [classes.buttonDone]: value === 'DONE',
        })}
      >
        {value}
      </Button>
      {!disabled && currentStateOptions && currentStateOptions.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {(currentStateOptions || []).map((it) => renderMenuItem(it))}
        </Menu>
      )}
    </Root>
  );
}
