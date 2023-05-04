import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  buttonRequested: {
    backgroundColor: "unset",
  },
  buttonApproved: {
    backgroundColor: theme.palette.success[500],
  },
  buttonRejected: {
    backgroundColor: theme.palette.error[500],
  },
}));

export function StatusMenu({ onChange, disabled, value }) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const [color, setColor] = useState("REQUESTED");
  const [expanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setColor(value);
  }, [value]);

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
    onChange(event.currentTarget.dataset.value);
    handleClose();
  };

  return (
    <div className={classes.status}>
      <Button
        aria-haspopup="true"
        aria-expanded={expanded}
        disabled={disabled}
        onClick={handleMenuClick}
        className={clsx({
          [classes.buttonRequested]: color === "REQUESTED",
          [classes.buttonApproved]: color === "APPROVED",
          [classes.buttonRejected]: color === "REJECTED",
        })}
      >
        {value}
      </Button>
      {!disabled && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleMenuItemClick} data-value={"REQUESTED"}>
            REQUESTED
          </MenuItem>
          <MenuItem onClick={handleMenuItemClick} data-value={"APPROVED"}>
            APPROVE
          </MenuItem>
          <MenuItem onClick={handleMenuItemClick} data-value={"REJECTED"}>
            REJECT
          </MenuItem>
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
