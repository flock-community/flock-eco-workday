import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import dayjs from 'dayjs';
import { EventClient, type FlockEventRequest, type FullFlockEvent } from '../../clients/EventClient';
import { BudgetAllocationClient } from '../../clients/BudgetAllocationClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { TransitionSlider } from '../../components/transitions/Slide';
import { mutatePeriod } from '../period/Period';
import { EVENT_FORM_ID, EventFormFields, eventFormSchema } from './EventForm';
import { EventBudgetManagementSection } from './EventBudgetManagementDialog';
import { apiAllocationsToTimeParticipants, apiAllocationsToMoneyParticipants, diffAllocations } from './eventBudgetTransformers';
import type { BudgetAllocation } from '../../wirespec/model';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';

type EventDialogProps = {
  open: boolean;
  code?: string;
  onComplete?: (item?: any) => void;
};

interface ParticipantBudgetState {
  personId: string;
  personName: string;
  moneyAmount: number;
  moneyDirty: boolean;
  timeAllocation: PersonTimeAllocation;
  timeDirty: boolean;
}

export function EventDialog({ open, code, onComplete }: EventDialogProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [moneyBudgetExpanded, setMoneyBudgetExpanded] = useState(false);
  const [timeBudgetExpanded, setTimeBudgetExpanded] = useState(false);
  const [eventData, setEventData] = useState<FullFlockEvent | null>(null);
  const [budgetsDirty, setBudgetsDirty] = useState(false);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [participantBudgets, setParticipantBudgets] = useState<ParticipantBudgetState[]>([]);
  const [loadedAllocations, setLoadedAllocations] = useState<BudgetAllocation[]>([]);
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
          setEventData(res); // Store full event data for budget dialog

          // Load budget allocations for this event
          BudgetAllocationClient.findAll(undefined, undefined, code).then((allocations) => {
            setLoadedAllocations(allocations);
            const timeParts = apiAllocationsToTimeParticipants(
              allocations, res.persons, dayjs(res.from), dayjs(res.to),
            );
            const moneyParts = apiAllocationsToMoneyParticipants(allocations, res.persons);
            setInitialTimeParticipants(timeParts);
            setInitialMoneyParticipants(moneyParts);
          });
        });
      } else {
        setState(eventFormSchema.cast());
        setEventData(null);
      }
    } else {
      setState(undefined);
      setEventData(null);
      setLoadedAllocations([]);
      setInitialTimeParticipants(undefined);
      setInitialMoneyParticipants(undefined);
    }
  }, [open, code]);

  const handleSubmit = (it) => {
    const eventData = {
      ...it,
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      hours: it.days.reduce((acc, cur) => acc + parseFloat(cur || 0), 0),
    };

    const savePromise = code
      ? EventClient.put(code, eventData)
      : EventClient.post(eventData);

    savePromise.then((res) => {
      if (participantBudgets.length > 0) {
        const defaultBudgetType = it.defaultTimeAllocationType || null;
        const { toCreate, toUpdate, toDelete } = diffAllocations(
          loadedAllocations,
          participantBudgets.map(p => p.timeAllocation),
          participantBudgets.map(p => ({ personId: p.personId, personName: p.personName, amount: p.moneyAmount })),
          res.code,
          dayjs(it.from),
          defaultBudgetType,
        );

        const promises: Promise<any>[] = [];
        // Deletes
        toDelete.forEach(id => promises.push(BudgetAllocationClient.deleteById(id)));
        // Creates
        toCreate.forEach(({ type, input }) => {
          if (type === 'hack') promises.push(BudgetAllocationClient.createHackTime(input as any));
          else if (type === 'study') promises.push(BudgetAllocationClient.createStudyTime(input as any));
          else if (type === 'money') promises.push(BudgetAllocationClient.createStudyMoney(input as any));
        });
        // Updates
        toUpdate.forEach(({ type, id, input }) => {
          if (type === 'hack') promises.push(BudgetAllocationClient.updateHackTime(id, input as any));
          else if (type === 'study') promises.push(BudgetAllocationClient.updateStudyTime(id, input as any));
          else if (type === 'money') promises.push(BudgetAllocationClient.updateStudyMoney(id, input as any));
        });

        Promise.all(promises).then(() => {
          setBudgetsDirty(false);
          onComplete?.(res);
        }).catch(err => {
          console.error('Failed to save budget allocations:', err);
          // Still complete the event save, but log the budget error
          setBudgetsDirty(false);
          onComplete?.(res);
        });
      } else {
        setBudgetsDirty(false);
        onComplete?.(res);
      }
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

  const handleBudgetStateChange = (budgetState: {
    moneyParticipants: PersonMoneyAllocation[];
    timeParticipants: PersonTimeAllocation[];
    dirty: boolean;
  }) => {
    setBudgetsDirty(budgetState.dirty);
    // Store budget state for save (convert to ParticipantBudgetState format)
    const combinedState: ParticipantBudgetState[] = budgetState.moneyParticipants.map(money => {
      const time = budgetState.timeParticipants.find(t => t.personId === money.personId);
      return {
        personId: money.personId,
        personName: money.personName,
        moneyAmount: money.amount,
        moneyDirty: budgetState.dirty,
        timeAllocation: time || { personId: money.personId, personName: money.personName, studyPeriod: null, hackPeriod: null },
        timeDirty: budgetState.dirty,
      };
    });
    setParticipantBudgets(combinedState);
  };

  const initialValues = state ? { ...eventFormSchema.default(), ...mutatePeriod(state) } : eventFormSchema.default();

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
                        onBudgetStateChange={handleBudgetStateChange}
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
