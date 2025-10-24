import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  canChangeStatus,
  filterTransitionsFromByStatus,
} from "./StatusMethods";

const useStyles = makeStyles((theme) => ({
  buttonRequested: {
    backgroundColor: "unset",
    "&:disabled": {
      backgroundColor: "unset",
      outline: "1px solid",
    },
  },
  buttonApproved: {
    backgroundColor: theme.palette.success[500],
    "&:disabled": {
      backgroundColor: theme.palette.success[500],
    },
  },
  buttonRejected: {
    backgroundColor: theme.palette.error[500],
    "&:disabled": {
      backgroundColor: theme.palette.error[500],
    },
  },
  buttonDone: {
    // @ts-ignore
    backgroundColor: theme.palette.done,
    "&:disabled": {
      // @ts-ignore
      backgroundColor: theme.palette.done,
    },
  },
}));

export function StatusMenu({ onChange, disabled, value }) {
  const classes = useStyles();

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
    <div className={classes.status}>
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
    </div>
  );
}

StatusMenu.propTypes = {
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  value: PropTypes.string,
};
