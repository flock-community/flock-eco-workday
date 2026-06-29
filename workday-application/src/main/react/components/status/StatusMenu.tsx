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

const Root = styled('div')(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';

  const softTintChip = (main: string, fg: string) => {
    const base = {
      backgroundColor: alpha(main, isDark ? 0.22 : 0.14),
      color: fg,
      outline: `1px solid ${alpha(main, isDark ? 0.5 : 0.4)}`,
    };
    return {
      ...base,
      '&:hover': { backgroundColor: alpha(main, isDark ? 0.3 : 0.2) },
      '&:disabled': base,
      '&.Mui-disabled': base,
    };
  };

  return {
    // Uniform width so every status reads as the same chip regardless of label length.
    '& .MuiButton-root': {
      minWidth: 124,
    },

    [`& .${classes.buttonRequested}`]: softTintChip(
      brand.cyan,
      isDark ? brand.cyan : brand.cyanDark,
    ),

    [`& .${classes.buttonApproved}`]: softTintChip(
      brand.teal,
      isDark ? brand.teal : brand.tealDark,
    ),

    [`& .${classes.buttonRejected}`]: softTintChip(
      theme.palette.error.main,
      isDark ? theme.palette.error.light : theme.palette.error.dark,
    ),

    [`& .${classes.buttonDone}`]: softTintChip(theme.palette.done, theme.palette.done),
  };
});

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
