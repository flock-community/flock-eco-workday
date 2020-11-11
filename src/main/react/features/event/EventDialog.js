import React, { useState } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EventIcon from "@material-ui/icons/CalendarToday";
import moment, { HTML5_FMT } from "moment";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { EventClient } from "../../clients/EventClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { EVENT_FORM_ID, EventForm } from "./EventForm";
import { isDefined } from "../../utils/validation";

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768 // should be a decent medium-sized breakpoint
  }
}));

export function EventDialog({ open, code, onComplete }) {
  const classes = useStyles();

  const [openDelete, setOpenDelete] = useState(false);

  const handleSubmit = it => {
    if (code) {
      EventClient.put(code, {
        description: it.description,
        from: it.from.format(HTML5_FMT.DATE),
        to: it.to.format(HTML5_FMT.DATE),
        days: it.days,
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur), 0),
        personCodes: it.personCodes
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res);
      });
    } else {
      EventClient.post({
        description: it.description,
        from: it.from.format(moment.HTML5_FMT.DATE),
        to: it.to.format(moment.HTML5_FMT.DATE),
        days: it.days,
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur), 0),
        personCodes: it.personCodes
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res);
      });
    }
  };

  const handleDelete = () => {
    EventClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
    });
  };
  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };
  const handleDeleteClose = () => {
    setOpenDelete(false);
  };
  const handleClose = () => {
    if (isDefined(onComplete)) onComplete();
  };
  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionSlider}
        TransitionProps={{ direction: "right" }}
      >
        <DialogHeader
          icon={<EventIcon />}
          headline="Create Event"
          subheadline="Have a fun time!"
          onClose={handleClose}
        />
        <DialogContent className={classes.dialogContent}>
          <Grid container spacing={1}>
            <Grid item>
              <EventForm code={code} onSubmit={handleSubmit} open={open} />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color={"primary"}
                component="a"
                href={`/event_rating/${code}`}
              >
                Event rating
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogFooter
          formId={EVENT_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this event.</Typography>
      </ConfirmDialog>
    </>
  );
}

EventDialog.propTypes = {
  open: PropTypes.bool,
  code: PropTypes.string,
  onComplete: PropTypes.func
};
