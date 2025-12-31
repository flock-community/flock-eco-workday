import Button from "@mui/material/Button";
import { styled } from '@mui/material/styles';
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Theme } from "@mui/material/styles";
import React, { useState } from "react";
import clsx from "clsx";
import {
  canChangeStatus,
  filterTransitionsFromByStatus,
} from "./StatusMethods";

const PREFIX = 'StatusMenu';

const classes = {
  buttonRequested: `${PREFIX}-buttonRequested`,
  buttonApproved: `${PREFIX}-buttonApproved`,
  buttonRejected: `${PREFIX}-buttonRejected`,
  buttonDone: `${PREFIX}-buttonDone`
};

const Root = styled('div')((
  {
    theme: Theme
  }
) => ({
  [`& .${classes.buttonRequested}`]: {
    backgroundColor: "unset",
    "&:disabled": {
      backgroundColor: "unset",
      outline: "1px solid",
    },
  },

  [`& .${classes.buttonApproved}`]: {
    backgroundColor: theme.palette.success[500],
    "&:disabled": {
      backgroundColor: theme.palette.success[500],
    },
  },

  [`& .${classes.buttonRejected}`]: {
    backgroundColor: theme.palette.error[500],
    "&:disabled": {
      backgroundColor: theme.palette.error[500],
    },
  },

  [`& .${classes.buttonDone}`]: {
    // @ts-ignore
    backgroundColor: theme.palette.done,
    "&:disabled": {
      // @ts-ignore
      backgroundColor: theme.palette.done,
    },
  }
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
    // @ts-ignore
    <Root className={classes.status}>
      <Button
        aria-haspopup="true"
        aria-expanded={expanded}
        disabled={disabled}
        onClick={handleMenuClick}
        className={clsx({
          [classes.buttonRequested]: value === "REQUESTED",
          [classes.buttonApproved]: value === "APPROVED",
          [classes.buttonRejected]: value === "REJECTED",
          [classes.buttonDone]: value === "DONE",
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
