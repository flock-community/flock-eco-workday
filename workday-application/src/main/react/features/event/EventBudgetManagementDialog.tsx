import { AccountBalance, ExpandMore, Info } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EventType } from '../../clients/EventClient';
import type { EventBudgetType } from '../../utils/mappings';
import type { Period } from '../period/Period';
import { EventBudgetSummaryBanner } from './EventBudgetSummaryBanner';
import {
  EventMoneyAllocationSection,
  type PersonMoneyAllocation,
} from './EventMoneyAllocationSection';
import {
  EventTimeAllocationSection,
  type PersonTimeAllocation,
} from './EventTimeAllocationSection';

interface EventBudgetManagementSectionProps {
  formValues: {
    budget: number;
    defaultTimeAllocationType: string | null;
    personIds: string[];
    from: Dayjs;
    to: Dayjs;
    days: number[];
    type: string;
  };
  persons: Array<{ uuid: string; firstname: string; lastname: string }>;
  timeExpanded?: boolean;
  setTimeExpanded?: (expanded: boolean) => void;
  moneyExpanded?: boolean;
  setMoneyExpanded?: (expanded: boolean) => void;
  onBudgetStateChange?: (state: {
    moneyParticipants: PersonMoneyAllocation[];
    timeParticipants: PersonTimeAllocation[];
    dirty: boolean;
  }) => void;
  initialTimeParticipants?: PersonTimeAllocation[];
  initialMoneyParticipants?: PersonMoneyAllocation[];
  readOnly?: boolean;
}

export function EventBudgetManagementSection({
  formValues,
  persons,
  timeExpanded = false,
  setTimeExpanded,
  moneyExpanded = false,
  setMoneyExpanded,
  onBudgetStateChange,
  initialTimeParticipants,
  initialMoneyParticipants,
  readOnly = false,
}: EventBudgetManagementSectionProps) {
  // Track whether initial API data has been applied (only once per dialog open)
  const initialLoadedRef = useRef(false);

  const [budgetExpanded, setBudgetExpanded] = useState(false);

  const [moneyParticipants, setMoneyParticipants] = useState<
    PersonMoneyAllocation[]
  >([]);
  const [timeParticipants, setTimeParticipants] = useState<
    PersonTimeAllocation[]
  >([]);
  // Refs to always have latest values for synchronous parent notification
  const moneyParticipantsRef = useRef<PersonMoneyAllocation[]>([]);
  const timeParticipantsRef = useRef<PersonTimeAllocation[]>([]);
  // Keep refs in sync with state (covers initial load and participant sync effects)
  moneyParticipantsRef.current = moneyParticipants;
  timeParticipantsRef.current = timeParticipants;

  // Dirty tracking: which participants have been manually edited
  const [dirtyMoney, setDirtyMoney] = useState<Set<string>>(new Set());
  const [dirtyTime, setDirtyTime] = useState<Set<string>>(new Set());

  // Derive values from formValues (single source of truth)
  const totalBudget = formValues.budget;
  const defaultBudgetType = formValues.defaultTimeAllocationType
    ? (formValues.defaultTimeAllocationType as EventBudgetType)
    : null;
  const participantIds = formValues.personIds;

  const showTimeSection = defaultBudgetType !== null;
  const showMoneySection =
    formValues.type === EventType.FLOCK_HACK_DAY ||
    formValues.type === EventType.CONFERENCE;

  // Reset initialLoadedRef when participants go to 0 (dialog reopened)
  useEffect(() => {
    if (participantIds.length === 0) {
      initialLoadedRef.current = false;
    }
  }, [participantIds.length]);

  // Participant sync effect: add/remove participants without auto-redistribution
  // Money: new participants get equal share of remaining budget, existing keep their amounts
  // Admin adjusts manually — "allocated vs total" indicator shows the gap
  useEffect(() => {
    setMoneyParticipants((prev) => {
      const participantCount = participantIds.length;
      if (participantCount === 0) return [];

      // On first render with empty prev, use initial data from API if available
      if (
        prev.length === 0 &&
        !initialLoadedRef.current &&
        initialMoneyParticipants &&
        initialMoneyParticipants.length > 0
      ) {
        initialLoadedRef.current = true;
        // Merge initial data with current participant list
        const initialMap = new Map(
          initialMoneyParticipants.map((p) => [p.personId, p]),
        );
        const existingTotal = participantIds
          .filter((id) => initialMap.has(id))
          .reduce((sum, id) => sum + initialMap.get(id)!.amount, 0);
        const newParticipantCount = participantIds.filter(
          (id) => !initialMap.has(id),
        ).length;
        const remainingBudget = Math.max(0, totalBudget - existingTotal);
        const newParticipantShare =
          newParticipantCount > 0
            ? Math.floor((remainingBudget / newParticipantCount) * 100) / 100
            : 0;

        return participantIds
          .map((personId) => {
            const person = persons.find((p) => p.uuid === personId);
            if (!person) return null;
            if (initialMap.has(personId)) return initialMap.get(personId)!;
            return {
              personId: person.uuid,
              personName: `${person.firstname} ${person.lastname}`,
              amount: newParticipantShare,
            };
          })
          .filter(Boolean) as PersonMoneyAllocation[];
      }

      const currentMap = new Map(prev.map((p) => [p.personId, p]));

      // Default share is computed for NEW participants only.
      const existingTotal = participantIds
        .filter((id) => currentMap.has(id))
        .reduce((sum, id) => sum + currentMap.get(id)!.amount, 0);
      const newParticipantCount = participantIds.filter(
        (id) => !currentMap.has(id),
      ).length;
      const remainingBudget = Math.max(0, totalBudget - existingTotal);
      const newParticipantShare =
        newParticipantCount > 0
          ? Math.floor((remainingBudget / newParticipantCount) * 100) / 100
          : 0;

      // Build new participant list — preserve existing amounts, assign remainder to new
      const result: PersonMoneyAllocation[] = participantIds
        .map((personId) => {
          const person = persons.find((p) => p.uuid === personId);
          if (!person) return null;

          // Existing participant: always preserve their current amount
          if (currentMap.has(personId)) {
            return currentMap.get(personId)!;
          }

          // New participant: share of remaining budget
          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            amount: newParticipantShare,
          };
        })
        .filter(Boolean) as PersonMoneyAllocation[];

      return result;
    });

    setTimeParticipants((prev) => {
      // On first render with empty prev, use initial data from API if available
      if (
        prev.length === 0 &&
        initialTimeParticipants &&
        initialTimeParticipants.length > 0
      ) {
        const initialMap = new Map(
          initialTimeParticipants.map((p) => [p.personId, p]),
        );
        return participantIds
          .map((personId) => {
            const person = persons.find((p) => p.uuid === personId);
            if (!person) return null;
            if (initialMap.has(personId)) return initialMap.get(personId)!;
            return {
              personId: person.uuid,
              personName: `${person.firstname} ${person.lastname}`,
              trainingPeriod: null,
              hackPeriod: null,
            };
          })
          .filter(Boolean) as PersonTimeAllocation[];
      }

      const currentMap = new Map(prev.map((p) => [p.personId, p]));

      const result: PersonTimeAllocation[] = participantIds
        .map((personId) => {
          const person = persons.find((p) => p.uuid === personId);
          if (!person) return null;

          // Preserve existing allocation if person already exists
          if (currentMap.has(personId)) {
            return currentMap.get(personId)!;
          }

          // New participant: using defaults (no custom periods)
          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            trainingPeriod: null,
            hackPeriod: null,
          };
        })
        .filter(Boolean) as PersonTimeAllocation[];

      return result;
    });

    // Clean up dirty flags for participants no longer in list
    setDirtyMoney((prev) => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach((id) => {
        if (!participantIds.includes(id)) newSet.delete(id);
      });
      return newSet;
    });
    setDirtyTime((prev) => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach((id) => {
        if (!participantIds.includes(id)) newSet.delete(id);
      });
      return newSet;
    });
  }, [participantIds, persons, totalBudget]);

  // React to defaultTimeAllocationType changes: update untouched time allocations
  useEffect(() => {
    if (timeParticipants.length === 0) return;

    // For participants not manually edited, clear their custom periods (revert to defaults)
    // This forces them to use the new defaultTimeAllocationType
    const updated = timeParticipants.map((p) => {
      if (dirtyTime.has(p.personId)) return p; // Preserve manual edits
      return { ...p, trainingPeriod: null, hackPeriod: null };
    });

    setTimeParticipants(updated);
  }, [defaultBudgetType]);

  // Compute summary values for collapsed view (MUST be before useEffect that uses isDirty)
  const totalMoneyAllocated = useMemo(
    () => moneyParticipants.reduce((sum, p) => sum + p.amount, 0),
    [moneyParticipants],
  );

  const totalTimeAllocated = useMemo(
    () =>
      timeParticipants.reduce((sum, p) => {
        const training =
          p.trainingPeriod?.days?.reduce((s, h) => s + h, 0) || 0;
        const hack = p.hackPeriod?.days?.reduce((s, h) => s + h, 0) || 0;
        return sum + training + hack;
      }, 0),
    [timeParticipants],
  );

  const isDirty = useMemo(
    () => dirtyMoney.size > 0 || dirtyTime.size > 0,
    [dirtyMoney, dirtyTime],
  );

  useEffect(() => {
    onBudgetStateChange?.({
      moneyParticipants,
      timeParticipants,
      dirty: isDirty,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moneyParticipants, timeParticipants, isDirty]);

  const getTimeSummary = (): string => {
    if (!defaultBudgetType) return 'No allocations';

    const participantsWithExceptions = timeParticipants.filter(
      (p) => p.trainingPeriod !== null || p.hackPeriod !== null,
    );
    const participantsWithDefaults = timeParticipants.filter(
      (p) => p.trainingPeriod === null && p.hackPeriod === null,
    );

    const parts: string[] = [];

    if (participantsWithDefaults.length > 0) {
      parts.push(
        `${participantsWithDefaults.length} using defaults (${defaultHoursPerDay}h/day ${defaultBudgetType})`,
      );
    }

    if (participantsWithExceptions.length > 0) {
      parts.push(
        `${participantsWithExceptions.length} custom allocation${participantsWithExceptions.length !== 1 ? 's' : ''}`,
      );
    }

    return parts.join(', ') || 'No allocations';
  };

  const getMoneySummary = (): string => {
    const parts: string[] = [];

    const participantAmounts = moneyParticipants.map((p) => p.amount);
    const uniqueAmounts = [...new Set(participantAmounts)].filter((a) => a > 0);
    const isEqualShare =
      uniqueAmounts.length === 1 &&
      participantAmounts.every((a) => a === uniqueAmounts[0]);

    if (isEqualShare && uniqueAmounts.length > 0) {
      parts.push(
        `€${uniqueAmounts[0].toLocaleString('nl-NL')}/person (${moneyParticipants.length})`,
      );
    } else if (uniqueAmounts.length > 0) {
      const groups = uniqueAmounts
        .map((amount) => ({
          amount,
          count: participantAmounts.filter((a) => a === amount).length,
        }))
        .sort((a, b) => b.amount - a.amount);

      parts.push(
        groups
          .map((g) => `${g.count}×€${g.amount.toLocaleString('nl-NL')}`)
          .join(', '),
      );
    }

    return parts.join('; ') || 'No allocations';
  };

  const handleMoneyParticipantsChange = (updated: PersonMoneyAllocation[]) => {
    let newDirty = false;
    updated.forEach((updatedP) => {
      const original = moneyParticipants.find(
        (p) => p.personId === updatedP.personId,
      );
      if (original && original.amount !== updatedP.amount) {
        setDirtyMoney((prev) => new Set(prev).add(updatedP.personId));
        newDirty = true;
      }
    });
    moneyParticipantsRef.current = updated;
    setMoneyParticipants(updated);
    // Synchronously notify parent (useEffect is async and may miss fast interactions)
    onBudgetStateChange?.({
      moneyParticipants: updated,
      timeParticipants: timeParticipantsRef.current,
      dirty: newDirty || isDirty,
    });
  };

  const handleTimeParticipantsChange = (updated: PersonTimeAllocation[]) => {
    let newDirty = false;
    updated.forEach((updatedP) => {
      const original = timeParticipants.find(
        (p) => p.personId === updatedP.personId,
      );
      if (original) {
        const hadCustom =
          original.trainingPeriod !== null || original.hackPeriod !== null;
        const hasCustom =
          updatedP.trainingPeriod !== null || updatedP.hackPeriod !== null;
        if (
          hadCustom !== hasCustom ||
          (hasCustom &&
            (JSON.stringify(original.trainingPeriod) !==
              JSON.stringify(updatedP.trainingPeriod) ||
              JSON.stringify(original.hackPeriod) !==
                JSON.stringify(updatedP.hackPeriod)))
        ) {
          setDirtyTime((prev) => new Set(prev).add(updatedP.personId));
          newDirty = true;
        }
      }
    });
    timeParticipantsRef.current = updated;
    setTimeParticipants(updated);
    // Synchronously notify parent (useEffect is async and may miss fast interactions)
    onBudgetStateChange?.({
      moneyParticipants: moneyParticipantsRef.current,
      timeParticipants: updated,
      dirty: newDirty || isDirty,
    });
  };

  const eventDays = formValues.to.diff(formValues.from, 'days') + 1;
  const eventDates: string[] = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < eventDays; i++) {
      dates.push(formValues.from.add(i, 'days').format('YYYY-MM-DD'));
    }
    return dates;
  }, [formValues.from, formValues.to, eventDays]);

  const defaultHoursPerDay = useMemo(() => {
    if (!formValues.days || formValues.days.length === 0) return 8;
    const totalHours = formValues.days.reduce(
      (acc, cur) => acc + parseFloat(String(cur || 0)),
      0,
    );
    return eventDays > 0 ? totalHours / eventDays : 8;
  }, [formValues.days, eventDays]);

  // Per-day hours for validation — avoids comparing against an average
  const eventDayHours = useMemo(() => {
    return Array(eventDays)
      .fill(0)
      .map((_, i) => parseFloat(String(formValues.days?.[i] ?? 8)) || 8);
  }, [formValues.days, eventDays]);

  return (
    <Accordion
      expanded={budgetExpanded}
      onChange={(_, isExpanded) => setBudgetExpanded(isExpanded)}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'background.default',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <EventBudgetSummaryBanner
          totalBudget={formValues.budget}
          totalAllocated={totalMoneyAllocated}
          totalTime={totalTimeAllocated}
          participantCount={participantIds.length}
          defaultHoursPerDay={defaultHoursPerDay}
          defaultBudgetType={formValues.defaultTimeAllocationType}
          hasUnsavedChanges={isDirty}
        />
      </AccordionSummary>

      <AccordionDetails sx={{ p: 2 }}>
        {!showTimeSection && !showMoneySection && (
          <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              No budget allocations for this event type. Time allocations
              require a default allocation type. Money allocations are available
              for Hack Day and Conference events.
            </Typography>
          </Alert>
        )}
        {!showTimeSection && showMoneySection && (
          <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              No default allocation type set. Set the event type above to enable
              time allocations.
            </Typography>
          </Alert>
        )}

        {readOnly ? (
          <Alert severity="info" icon={<Info />} sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              Allocations are managed automatically
            </Typography>
            <Typography variant="body2">
              Budget allocations are generated for each participant when you
              save the event, based on its type, dates and budget. They
              can&apos;t be edited here.
            </Typography>
            {showTimeSection && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Time: {getTimeSummary()}
              </Typography>
            )}
            {showMoneySection && (
              <Typography variant="body2">
                Money: {getMoneySummary()} — €
                {totalMoneyAllocated.toLocaleString('nl-NL')} / €
                {totalBudget.toLocaleString('nl-NL')}
              </Typography>
            )}
          </Alert>
        ) : (
          <Grid container spacing={1}>
            {showTimeSection && (
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={timeExpanded}
                  onChange={(_, isExpanded) => setTimeExpanded?.(isExpanded)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <AccountBalance color="action" />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Time Budget Allocations
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {getTimeSummary()}
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 3 }}>
                    <EventTimeAllocationSection
                      eventDates={eventDates}
                      defaultHoursPerDay={defaultHoursPerDay}
                      eventDayHours={eventDayHours}
                      defaultBudgetType={defaultBudgetType!}
                      participants={timeParticipants}
                      onParticipantsChange={handleTimeParticipantsChange}
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
            {showMoneySection && (
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={moneyExpanded}
                  onChange={(_, isExpanded) => setMoneyExpanded?.(isExpanded)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      bgcolor: 'action.hover',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <AccountBalance color="action" />
                        <Typography variant="subtitle1" fontWeight="medium">
                          Money Budget Allocations
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        color={
                          totalMoneyAllocated > totalBudget
                            ? 'warning.main'
                            : 'text.secondary'
                        }
                      >
                        {getMoneySummary()} — €
                        {totalMoneyAllocated.toLocaleString('nl-NL')} / €
                        {totalBudget.toLocaleString('nl-NL')} allocated
                      </Typography>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails sx={{ p: 3 }}>
                    <EventMoneyAllocationSection
                      totalBudget={totalBudget}
                      participants={moneyParticipants}
                      onParticipantsChange={handleMoneyParticipantsChange}
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
            )}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
