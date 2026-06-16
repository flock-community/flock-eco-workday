import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import { EventClient, type FlockEventRequest } from '../../clients/EventClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { TransitionSlider } from '../../components/transitions/Slide';
import { schema } from '../workday/WorkDayForm';
import { EVENT_FORM_ID, EventForm } from './EventForm';

type EventDialogProps = {
  open: boolean;
  code?: string;
  onComplete?: (item?: any) => void;
};

export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);

  // Raw form state: dates are Dayjs here and serialized on submit.
  const [state, setState] = useState<any>(undefined);

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
        setState(schema.getDefault());
      }
    } else {
      setState(undefined);
    }
  }, [open, code]);

  const handleSubmit = (it) => {
    const body: FlockEventRequest = {
      description: it.description,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
      days: it.days,
      costs: it.costs,
      personIds: it.personIds,
      type: it.type,
    };
    const persist = code ? EventClient.put(code, body) : EventClient.post(body);
    persist.then((res) => {
      onComplete?.(res);
    });
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
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionSlider}
        maxWidth="lg"
        fullWidth
      >
        <DialogHeader
          icon={<EventIcon />}
          headline="Create Event"
          subheadline="Have a fun time!"
          onClose={handleClose}
        />
        <DialogBody>
          <Grid container spacing={1}>
            <Grid>
              {state && <EventForm value={state} onSubmit={handleSubmit} />}
            </Grid>
            {code && (
              <Grid>
                <Button
                  variant="contained"
                  color={'primary'}
                  component="a"
                  href={`/event_rating/${code}`}
                >
                  Event rating
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogBody>
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
