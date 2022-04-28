import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import EventIcon from "@material-ui/icons/CalendarToday";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import { EventClient } from "../../clients/EventClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";
import { EVENT_FORM_ID, EventForm } from "./EventForm";
import { schema } from "../workday/WorkDayForm";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768, // should be a decent medium-sized breakpoint
  },
}));

type EventDialogProps = {
  open: boolean;
  code?: string;
  onComplete?: (item?: any) => void;
};

export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const classes = useStyles();

  const [openDelete, setOpenDelete] = useState(false);

  const [state, setState] = useState<any>(null);

  useEffect(() => {
    if (open) {
      if (code) {
        EventClient.get(code).then((res) => {
          setState({
            description: res.description,
            personIds: res.persons.map((it) => it.uuid) ?? [],
            from: res.from,
            to: res.to,
            days: res.days,
          });
        });
      } else {
        setState(schema.cast());
      }
    } else {
      setState(null);
    }
  }, [open, code]);

  const handleSubmit = (it) => {
    if (code) {
      EventClient.put(code, {
        description: it.description,
        from: it.from.format(ISO_8601_DATE),
        to: it.to.format(ISO_8601_DATE),
        days: it.days,
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
        personIds: it.personIds,
      }).then((res) => {
        onComplete?.(res);
      });
    } else {
      EventClient.post({
        description: it.description,
        from: it.from.format(ISO_8601_DATE),
        to: it.to.format(ISO_8601_DATE),
        days: it.days,
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
        personIds: it.personIds,
      }).then((res) => {
        onComplete?.(res);
      });
    }
  };

  const handleDelete = () => {
    EventClient.delete(code!).then(() => {
      onComplete?.();
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
    onComplete?.();
  };
  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        // @ts-ignore
        TransitionComponent={TransitionSlider}
        // @ts-ignore
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
              {state && <EventForm value={state} onSubmit={handleSubmit} />}
            </Grid>
            {code && (
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
            )}
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
