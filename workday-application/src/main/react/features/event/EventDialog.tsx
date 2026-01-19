import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import { EventClient, type FlockEventRequest, type FullFlockEvent } from '../../clients/EventClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { TransitionSlider } from '../../components/transitions/Slide';
import { schema } from '../workday/WorkDayForm';
import { EVENT_FORM_ID, EventForm } from './EventForm';
import { EventBudgetManagementSection } from './EventBudgetManagementDialog';

type EventDialogProps = {
  open: boolean;
  code?: string;
  onComplete?: (item?: any) => void;
};

export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [budgetExpanded, setBudgetExpanded] = useState(false);
  const [eventData, setEventData] = useState<FullFlockEvent | null>(null);

  const [state, setState] = useState<FlockEventRequest | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (code) {
        EventClient.get(code).then((res) => {
          setState({
            ...res,
            personIds: res.persons.map((it) => it.uuid) ?? [],
          });
          setEventData(res); // Store full event data for budget dialog
        });
      } else {
        setState(schema.cast());
        setEventData(null);
      }
    } else {
      setState(undefined);
      setEventData(null);
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
            {code && eventData && (
              <Grid size={{ xs: 12 }}>
                <EventBudgetManagementSection
                  event={eventData}
                  expanded={budgetExpanded}
                  onChange={setBudgetExpanded}
                />
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
