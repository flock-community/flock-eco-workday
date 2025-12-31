import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { useState } from 'react';
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
  [`& .${classes.buttonRequested}`]: {
    backgroundColor: 'unset',
    '&:disabled': {
      backgroundColor: 'unset',
      outline: '1px solid',
    },
  },

  [`& .${classes.buttonApproved}`]: {
    backgroundColor: theme.palette.success[500],
    '&:disabled': {
      backgroundColor: theme.palette.success[500],
    },
  },

  [`& .${classes.buttonRejected}`]: {
    backgroundColor: theme.palette.error[500],
    '&:disabled': {
      backgroundColor: theme.palette.error[500],
    },
  },

  [`& .${classes.buttonDone}`]: {
    // @ts-expect-error
    backgroundColor: theme.palette.done,
    '&:disabled': {
      // @ts-expect-error
      backgroundColor: theme.palette.done,
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
