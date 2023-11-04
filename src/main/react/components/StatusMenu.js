import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

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
    backgroundColor: theme.palette.done,
    "&:disabled": {
      backgroundColor: theme.palette.done,
    },
  },
}));

const allStatusTransitions = [
  { from: "REQUESTED", to: "APPROVED" },
  { from: "REQUESTED", to: "REJECTED" },
  { from: "APPROVED", to: "REQUESTED" },
  { from: "APPROVED", to: "DONE" },
  { from: "REJECTED", to: "REQUESTED" },
];

const filterTransitionsFromByStatus = (statusToFilter) =>
  allStatusTransitions
    .filter(
      (transitionStateProp) => transitionStateProp.from === statusToFilter
    )
    .map((it) => it.to);

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

  const canChangeStatus = (oldValue, newValue) => {
    const possibleTransitionsForOldValue =
      filterTransitionsFromByStatus(oldValue);
    return (
      possibleTransitionsForOldValue.filter(
        (transitionStateProp) => transitionStateProp === newValue
      ).length === 1
    );
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
