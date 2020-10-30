import React from "react";
import AddIcon from "@material-ui/icons/Add";
import { Fab } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  root: {
    position: "fixed",
    bottom: 16,
    right: 16
  }
}));

const AddActionFab = props => {
  const classes = useStyles();

  return (
    <Fab className={classes.root} {...props}>
      <AddIcon />
    </Fab>
  );
};

AddActionFab.propTypes = {
  color: PropTypes.string,
  onClick: PropTypes.func
};

export { AddActionFab };
