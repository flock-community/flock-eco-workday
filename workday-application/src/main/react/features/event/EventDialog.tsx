import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Divider } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import EventIcon from "@mui/icons-material/CalendarToday";
import { ConfirmDialog } from "@workday-core/components/ConfirmDialog";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { EventClient, FlockEventRequest } from "../../clients/EventClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { EVENT_FORM_ID, EventForm } from "./EventForm";
import { schema } from "../workday/WorkDayForm";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import { DialogFooter, DialogHeader } from "../../components/dialog";

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

  const [state, setState] = useState<FlockEventRequest | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (code) {
        EventClient.get(code).then((res) => {
          setState({
            ...res,
            personIds: res.persons.map((it) => it.uuid) ?? [],
          });
        });
      } else {
        setState(schema.cast());
      }
    } else {
      setState(undefined);
    }
  }, [open, code]);

  const handleSubmit = (it) => {
    if (code) {
      EventClient.put(code, {
        ...it,
        from: it.from.format(ISO_8601_DATE),
        to: it.to.format(ISO_8601_DATE),
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
      }).then((res) => {
        onComplete?.(res);
      });
    } else {
      EventClient.post({
        ...it,
        from: it.from.format(ISO_8601_DATE),
        to: it.to.format(ISO_8601_DATE),
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
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
        TransitionComponent={TransitionSlider}
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
        <Typography>Are you sure you want to remove this event?</Typography>
      </ConfirmDialog>
    </>
  );
}
