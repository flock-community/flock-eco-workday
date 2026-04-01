import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';
import { EventClient, type FlockEventRequest, type FullFlockEvent } from '../../clients/EventClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { TransitionSlider } from '../../components/transitions/Slide';
import { mutatePeriod } from '../period/Period';
import { EVENT_FORM_ID, EventFormFields, eventFormSchema } from './EventForm';
import { EventBudgetManagementSection } from './EventBudgetManagementDialog';
import { apiAllocationsToTimeParticipants, apiAllocationsToMoneyParticipants } from './eventBudgetTransformers';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';

type EventDialogProps = {
  open: boolean;
  code?: string;
  onComplete?: (item?: any) => void;
};

export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [moneyBudgetExpanded, setMoneyBudgetExpanded] = useState(false);
  const [timeBudgetExpanded, setTimeBudgetExpanded] = useState(false);
  const [eventData, setEventData] = useState<FullFlockEvent | null>(null);
  const [initialTimeParticipants, setInitialTimeParticipants] = useState<PersonTimeAllocation[] | undefined>(undefined);
  const [initialMoneyParticipants, setInitialMoneyParticipants] = useState<PersonMoneyAllocation[] | undefined>(undefined);

  const [state, setState] = useState<FlockEventRequest | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (code) {
        EventClient.get(code).then((res) => {
          setState({
            ...res,
            personIds: res.persons.map((it) => it.uuid) ?? [],
          });
          setEventData(res);

          // Use allocations from the event response (backend provides them)
          const allocations = res.budgetAllocations ?? [];
          const timeParts = apiAllocationsToTimeParticipants(
            allocations, res.persons, dayjs(res.from), dayjs(res.to),
          );
          const moneyParts = apiAllocationsToMoneyParticipants(allocations, res.persons);
          setInitialTimeParticipants(timeParts);
          setInitialMoneyParticipants(moneyParts);
        });
      } else {
        setState(eventFormSchema.cast());
        setEventData(null);
      }
    } else {
      setState(undefined);
      setEventData(null);
      setInitialTimeParticipants(undefined);
      setInitialMoneyParticipants(undefined);
    }
  }, [open, code]);

  const handleSubmit = async (it) => {
    try {
      const eventData = {
        ...it,
        from: it.from.format(ISO_8601_DATE),
        to: it.to.format(ISO_8601_DATE),
        hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
      };

      // Backend handles all budget allocation sync atomically
      const res = code
        ? await EventClient.put(code, eventData)
        : await EventClient.post(eventData);

      onComplete?.(res);
    } catch (err) {
      console.error('EventDialog handleSubmit failed:', err);
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

  const initialValues = useMemo(
    () => state ? { ...eventFormSchema.default(), ...mutatePeriod(state) } : eventFormSchema.default(),
    [state],
  );

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
          {state && (
            <Formik
              enableReinitialize
              initialValues={initialValues}
              onSubmit={handleSubmit}
              validationSchema={eventFormSchema}
            >
              {(formik) => (
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12 }}>
                    <Form id={EVENT_FORM_ID}>
                      <EventFormFields values={formik.values} setFieldValue={formik.setFieldValue} />
                    </Form>
                  </Grid>
                  {code && eventData && (
                    <Grid size={{ xs: 12 }}>
                      <EventBudgetManagementSection
                        formValues={formik.values}
                        persons={eventData.persons}
                        timeExpanded={timeBudgetExpanded}
                        setTimeExpanded={setTimeBudgetExpanded}
                        moneyExpanded={moneyBudgetExpanded}
                        setMoneyExpanded={setMoneyBudgetExpanded}
                        initialTimeParticipants={initialTimeParticipants}
                        initialMoneyParticipants={initialMoneyParticipants}
                      />
                    </Grid>
                  )}
                  {code && (
                    <Grid size={{ xs: 12 }}>
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
              )}
            </Formik>
          )}
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
