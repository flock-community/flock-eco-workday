import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { EventDialog } from "./EventDialog";
import { EventList } from "./EventList";
import { AddActionFab } from "../../components/FabButtons";

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
});

/**
 * @return {null}
 */
export function EventFeature() {
  const classes = useStyles();

  const [reload, setReload] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<any>(null);

  function handleCompleteDialog() {
    setReload(!reload);
    setOpen(false);
    setState(null);
  }

  function handleClickAdd() {
    setState(null);
    setOpen(true);
  }

  function handleClickRow(item) {
    setState(item);
    setOpen(true);
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <EventList onClickRow={handleClickRow} refresh={reload} />
        </Grid>
      </Grid>
      <EventDialog
        open={open}
        code={state && state.code}
        onComplete={handleCompleteDialog}
      />

      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  );
}

EventFeature.propTypes = {};
