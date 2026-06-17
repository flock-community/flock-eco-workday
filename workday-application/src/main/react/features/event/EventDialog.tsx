import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { BudgetAllocationClient } from '../../clients/BudgetAllocationClient';
import {
  EventClient,
  type FlockEventRequest,
  type FullFlockEvent,
} from '../../clients/EventClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { TransitionSlider } from '../../components/transitions/Slide';
import type { EventBudgetType } from '../../utils/mappings';
import type { BudgetAllocation } from '../../wirespec/model';
import { mutatePeriod } from '../period/Period';
import { EventBudgetManagementSection } from './EventBudgetManagementDialog';
import { EVENT_FORM_ID, EventFormFields, eventFormSchema } from './EventForm';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';
import {
  apiAllocationsToMoneyParticipants,
  apiAllocationsToTimeParticipants,
  diffTimeOverrides,
  type TimeAllocationMutation,
} from './eventBudgetTransformers';

type EventDialogProps = {
  open: boolean;
  code?: string;
  onComplete?: (item?: any) => void;
};

function createTimeAllocation(
  m: TimeAllocationMutation,
): Promise<BudgetAllocation> {
  return m.type === 'hack'
    ? BudgetAllocationClient.createHackTime(m.input)
    : BudgetAllocationClient.createTrainingTime(m.input);
}

function updateTimeAllocation(
  m: TimeAllocationMutation & { id: string },
): Promise<BudgetAllocation> {
  return m.type === 'hack'
    ? BudgetAllocationClient.updateHackTime(m.id, m.input)
    : BudgetAllocationClient.updateTrainingTime(m.id, m.input);
}

export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [moneyBudgetExpanded, setMoneyBudgetExpanded] = useState(false);
  const [timeBudgetExpanded, setTimeBudgetExpanded] = useState(false);
  const [eventData, setEventData] = useState<FullFlockEvent | null>(null);
  const [initialTimeParticipants, setInitialTimeParticipants] = useState<
    PersonTimeAllocation[] | undefined
  >(undefined);
  const [initialMoneyParticipants, setInitialMoneyParticipants] = useState<
    PersonMoneyAllocation[] | undefined
  >(undefined);

  const [budgetState, setBudgetState] = useState<{
    timeParticipants: PersonTimeAllocation[];
  }>({ timeParticipants: [] });
  const [budgetsDirty, setBudgetsDirty] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);

  // Raw form state: dates are Dayjs here and serialized on submit.
  const [state, setState] = useState<any>(undefined);

  useEffect(() => {
    if (open) {
      if (code) {
        EventClient.get(code).then((res) => {
          setState({
            ...res,
            personIds: res.persons.map((it) => it.uuid) ?? [],
            // Map the contract enum back to the form's UI values.
            defaultTimeAllocationType:
              res.defaultTimeAllocationType === 'HACK_TIME'
                ? 'HACK'
                : res.defaultTimeAllocationType === 'TRAINING_TIME'
                  ? 'TRAINING'
                  : (res.defaultTimeAllocationType ?? null),
          });
          setEventData(res);

          // Allocations are no longer inline on the event response; fetch them
          // from the dedicated budget-allocations endpoint, scoped to this event.
          BudgetAllocationClient.findAll(undefined, undefined, code).then(
            (allocations) => {
              const timeParts = apiAllocationsToTimeParticipants(
                allocations,
                res.persons,
                dayjs(res.from),
                dayjs(res.to),
              );
              const moneyParts = apiAllocationsToMoneyParticipants(
                allocations,
                res.persons,
              );
              setInitialTimeParticipants(timeParts);
              setInitialMoneyParticipants(moneyParts);
            },
          );
        });
      } else {
        setState(eventFormSchema.getDefault());
        setEventData(null);
      }
    } else {
      setState(undefined);
      setEventData(null);
      setInitialTimeParticipants(undefined);
      setInitialMoneyParticipants(undefined);
      setBudgetState({ timeParticipants: [] });
      setBudgetsDirty(false);
    }
  }, [open, code]);

  const handleSubmit = (it) => {
    const body: FlockEventRequest = {
      description: it.description,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
      days: it.days,
      budget: it.budget,
      personIds: it.personIds,
      type: it.type,
      // Translate the form's UI value to the contract enum.
      defaultTimeAllocationType:
        it.defaultTimeAllocationType === 'HACK'
          ? 'HACK_TIME'
          : it.defaultTimeAllocationType === 'TRAINING'
            ? 'TRAINING_TIME'
            : (it.defaultTimeAllocationType ?? null),
    };
    const persist = code ? EventClient.put(code, body) : EventClient.post(body);
    persist.then((res) => {
      const showTime = !!it.defaultTimeAllocationType;
      if (!code || !showTime) {
        setBudgetsDirty(false);
        onComplete?.(res);
        return;
      }
      const eventCode = res.code ?? code;
      const eventFrom = dayjs(it.from);
      const eventDefaultDays = (it.days ?? []).map(
        (d) => parseFloat(String(d ?? 0)) || 0,
      );
      const defaultBudgetType = it.defaultTimeAllocationType as EventBudgetType;

      // Re-read post-save so overrides re-apply onto the backend's fresh rows (reusing ids).
      BudgetAllocationClient.findAll(undefined, undefined, eventCode)
        .then((fresh) =>
          diffTimeOverrides(
            fresh,
            budgetState.timeParticipants,
            eventDefaultDays,
            defaultBudgetType,
            eventCode,
            eventFrom,
          ),
        )
        .then(({ toCreate, toUpdate, toDelete }) =>
          Promise.all([
            ...toDelete.map((id) => BudgetAllocationClient.deleteById(id)),
            ...toCreate.map(createTimeAllocation),
            ...toUpdate.map(updateTimeAllocation),
          ]),
        )
        .catch((err) => {
          console.error('Failed to save time allocation overrides:', err);
        })
        .finally(() => {
          setBudgetsDirty(false);
          onComplete?.(res);
        });
    });
  };

  const handleBudgetStateChange = (next: {
    moneyParticipants: PersonMoneyAllocation[];
    timeParticipants: PersonTimeAllocation[];
    dirty: boolean;
  }) => {
    setBudgetState({ timeParticipants: next.timeParticipants });
    setBudgetsDirty(next.dirty);
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
    if (budgetsDirty) {
      setShowCloseWarning(true);
    } else {
      onComplete?.();
    }
  };
  const handleConfirmClose = () => {
    setBudgetsDirty(false);
    setShowCloseWarning(false);
    onComplete?.();
  };

  const initialValues = useMemo(
    () =>
      state
        ? { ...eventFormSchema.getDefault(), ...mutatePeriod(state) }
        : eventFormSchema.getDefault(),
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
                      <EventFormFields
                        values={formik.values}
                        setFieldValue={formik.setFieldValue}
                      />
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
                        onBudgetStateChange={handleBudgetStateChange}
                        initialTimeParticipants={initialTimeParticipants}
                        initialMoneyParticipants={initialMoneyParticipants}
                        moneyReadOnly
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
      <ConfirmDialog
        open={showCloseWarning}
        onClose={() => setShowCloseWarning(false)}
        onConfirm={handleConfirmClose}
      >
        <Typography>You have unsaved budget changes. Close anyway?</Typography>
      </ConfirmDialog>
    </>
  );
}
