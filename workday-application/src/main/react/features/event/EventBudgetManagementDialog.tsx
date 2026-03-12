import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  Box,
  Typography,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {ExpandMore, Info, AccountBalance} from '@mui/icons-material';
import dayjs, { type Dayjs } from 'dayjs';
import {
  EventMoneyAllocationSection,
  type PersonMoneyAllocation,
} from './EventMoneyAllocationSection';
import {
  EventTimeAllocationSection,
  type PersonTimeAllocation,
} from './EventTimeAllocationSection';
import { EventBudgetType } from '../../utils/mappings';
import type { Period } from '../period/Period';
import Grid from "@mui/material/Grid";
import { EventBudgetSummaryBanner } from './EventBudgetSummaryBanner';
import { EventType } from '../../clients/EventClient';

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
    dirty: boolean
  }) => void;
  initialTimeParticipants?: PersonTimeAllocation[];
  initialMoneyParticipants?: PersonMoneyAllocation[];
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
                                             }: EventBudgetManagementSectionProps) {
  // Track whether initial API data has been applied (only once per dialog open)
  const initialLoadedRef = useRef(false);

  // Top-level accordion state: collapsed by default
  const [budgetExpanded, setBudgetExpanded] = useState(false);

  // Separate state for money and time allocations
  const [moneyParticipants, setMoneyParticipants] = useState<PersonMoneyAllocation[]>([]);
  const [timeParticipants, setTimeParticipants] = useState<PersonTimeAllocation[]>([]);

  // Dirty tracking: which participants have been manually edited
  const [dirtyMoney, setDirtyMoney] = useState<Set<string>>(new Set());
  const [dirtyTime, setDirtyTime] = useState<Set<string>>(new Set());

  // Derive values from formValues (single source of truth)
  const totalBudget = formValues.budget;
  const defaultBudgetType = formValues.defaultTimeAllocationType
    ? (formValues.defaultTimeAllocationType as EventBudgetType)
    : null;
  const participantIds = formValues.personIds;

  // Determine section visibility
  const showTimeSection = defaultBudgetType !== null;
  const showMoneySection = formValues.type === EventType.FLOCK_HACK_DAY || formValues.type === EventType.CONFERENCE;

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
    setMoneyParticipants(prev => {
      const participantCount = participantIds.length;
      if (participantCount === 0) return [];

      // On first render with empty prev, use initial data from API if available
      if (prev.length === 0 && !initialLoadedRef.current && initialMoneyParticipants && initialMoneyParticipants.length > 0) {
        initialLoadedRef.current = true;
        // Merge initial data with current participant list
        const initialMap = new Map(initialMoneyParticipants.map(p => [p.personId, p]));
        const existingTotal = participantIds
          .filter(id => initialMap.has(id))
          .reduce((sum, id) => sum + initialMap.get(id)!.amount, 0);
        const newParticipantCount = participantIds.filter(id => !initialMap.has(id)).length;
        const remainingBudget = Math.max(0, totalBudget - existingTotal);
        const newParticipantShare = newParticipantCount > 0
          ? Math.floor((remainingBudget / newParticipantCount) * 100) / 100
          : 0;

        return participantIds.map(personId => {
          const person = persons.find(p => p.uuid === personId);
          if (!person) return null;
          if (initialMap.has(personId)) return initialMap.get(personId)!;
          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            amount: newParticipantShare,
          };
        }).filter(Boolean) as PersonMoneyAllocation[];
      }

      // Get current participants as a map
      const currentMap = new Map(prev.map(p => [p.personId, p]));

      // Calculate default share for NEW participants only
      const existingTotal = participantIds
        .filter(id => currentMap.has(id))
        .reduce((sum, id) => sum + currentMap.get(id)!.amount, 0);
      const newParticipantCount = participantIds.filter(id => !currentMap.has(id)).length;
      const remainingBudget = Math.max(0, totalBudget - existingTotal);
      const newParticipantShare = newParticipantCount > 0
        ? Math.floor((remainingBudget / newParticipantCount) * 100) / 100
        : 0;

      // Build new participant list — preserve existing amounts, assign remainder to new
      const result: PersonMoneyAllocation[] = participantIds.map(personId => {
        const person = persons.find(p => p.uuid === personId);
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
      }).filter(Boolean) as PersonMoneyAllocation[];

      return result;
    });

    // Update time participants separately
    setTimeParticipants(prev => {
      // On first render with empty prev, use initial data from API if available
      if (prev.length === 0 && initialTimeParticipants && initialTimeParticipants.length > 0) {
        const initialMap = new Map(initialTimeParticipants.map(p => [p.personId, p]));
        return participantIds.map(personId => {
          const person = persons.find(p => p.uuid === personId);
          if (!person) return null;
          if (initialMap.has(personId)) return initialMap.get(personId)!;
          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            studyPeriod: null,
            hackPeriod: null,
          };
        }).filter(Boolean) as PersonTimeAllocation[];
      }

      const currentMap = new Map(prev.map(p => [p.personId, p]));

      const result: PersonTimeAllocation[] = participantIds.map(personId => {
        const person = persons.find(p => p.uuid === personId);
        if (!person) return null;

        // Preserve existing allocation if person already exists
        if (currentMap.has(personId)) {
          return currentMap.get(personId)!;
        }

        // New participant: using defaults (no custom periods)
        return {
          personId: person.uuid,
          personName: `${person.firstname} ${person.lastname}`,
          studyPeriod: null,
          hackPeriod: null,
        };
      }).filter(Boolean) as PersonTimeAllocation[];

      return result;
    });

    // Clean up dirty flags for participants no longer in list
    setDirtyMoney(prev => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach(id => {
        if (!participantIds.includes(id)) newSet.delete(id);
      });
      return newSet;
    });
    setDirtyTime(prev => {
      const newSet = new Set(prev);
      Array.from(newSet).forEach(id => {
        if (!participantIds.includes(id)) newSet.delete(id);
      });
      return newSet;
    });
  }, [participantIds, persons, totalBudget]); // React to participant and budget changes

  // React to defaultTimeAllocationType changes: update untouched time allocations
  useEffect(() => {
    if (timeParticipants.length === 0) return;

    // For participants not manually edited, clear their custom periods (revert to defaults)
    // This forces them to use the new defaultTimeAllocationType
    const updated = timeParticipants.map(p => {
      if (dirtyTime.has(p.personId)) return p; // Preserve manual edits
      // Clear custom periods to use new defaults
      return { ...p, studyPeriod: null, hackPeriod: null };
    });

    setTimeParticipants(updated);
  }, [defaultBudgetType]); // React to allocation type changes

  // Compute summary values for collapsed view (MUST be before useEffect that uses isDirty)
  const totalMoneyAllocated = useMemo(
    () => moneyParticipants.reduce((sum, p) => sum + p.amount, 0),
    [moneyParticipants]
  );

  const totalTimeAllocated = useMemo(
    () => timeParticipants.reduce((sum, p) => {
      const study = p.studyPeriod?.days?.reduce((s, h) => s + h, 0) || 0;
      const hack = p.hackPeriod?.days?.reduce((s, h) => s + h, 0) || 0;
      return sum + study + hack;
    }, 0),
    [timeParticipants]
  );

  const isDirty = useMemo(
    () => dirtyMoney.size > 0 || dirtyTime.size > 0,
    [dirtyMoney, dirtyTime]
  );

  // Notify parent of budget state changes
  useEffect(() => {
    onBudgetStateChange?.({
      moneyParticipants,
      timeParticipants,
      dirty: isDirty,
    });
  }, [moneyParticipants, timeParticipants, isDirty, onBudgetStateChange]);

  // Helper: Generate time allocation summary
  const getTimeSummary = (): string => {
    if (!defaultBudgetType) return 'No allocations';

    const participantsWithExceptions = timeParticipants.filter(
      (p) => p.studyPeriod !== null || p.hackPeriod !== null
    );
    const participantsWithDefaults = timeParticipants.filter(
      (p) => p.studyPeriod === null && p.hackPeriod === null
    );

    const parts: string[] = [];

    // Default count
    if (participantsWithDefaults.length > 0) {
      parts.push(
        `${participantsWithDefaults.length} using defaults (${defaultHoursPerDay}h/day ${defaultBudgetType})`
      );
    }

    // Exceptions count
    if (participantsWithExceptions.length > 0) {
      parts.push(`${participantsWithExceptions.length} custom allocation${participantsWithExceptions.length !== 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'No allocations';
  };

  // Helper: Generate money allocation summary
  const getMoneySummary = (): string => {
    const parts: string[] = [];

    // Check if equal share
    const participantAmounts = moneyParticipants.map((p) => p.amount);
    const uniqueAmounts = [...new Set(participantAmounts)].filter((a) => a > 0);
    const isEqualShare =
      uniqueAmounts.length === 1 &&
      participantAmounts.every((a) => a === uniqueAmounts[0]);

    // Participants
    if (isEqualShare && uniqueAmounts.length > 0) {
      parts.push(
        `€${uniqueAmounts[0].toLocaleString('nl-NL')}/person (${moneyParticipants.length})`
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
          .map(
            (g) =>
              `${g.count}×€${g.amount.toLocaleString('nl-NL')}`
          )
          .join(', ')
      );
    }

    return parts.join('; ') || 'No allocations';
  };

  // Handle money participant changes with dirty tracking
  const handleMoneyParticipantsChange = (updated: PersonMoneyAllocation[]) => {
    // Mark changed participants as dirty
    updated.forEach(updatedP => {
      const original = moneyParticipants.find(p => p.personId === updatedP.personId);
      if (original && original.amount !== updatedP.amount) {
        setDirtyMoney(prev => new Set(prev).add(updatedP.personId));
      }
    });
    setMoneyParticipants(updated);
  };

  // Handle time participant changes with dirty tracking
  const handleTimeParticipantsChange = (updated: PersonTimeAllocation[]) => {
    // Mark changed participants as dirty
    updated.forEach(updatedP => {
      const original = timeParticipants.find(p => p.personId === updatedP.personId);
      if (original) {
        const hadCustom = original.studyPeriod !== null || original.hackPeriod !== null;
        const hasCustom = updatedP.studyPeriod !== null || updatedP.hackPeriod !== null;
        if (hadCustom !== hasCustom || (hasCustom && (
          JSON.stringify(original.studyPeriod) !== JSON.stringify(updatedP.studyPeriod) ||
          JSON.stringify(original.hackPeriod) !== JSON.stringify(updatedP.hackPeriod)
        ))) {
          setDirtyTime(prev => new Set(prev).add(updatedP.personId));
        }
      }
    });
    setTimeParticipants(updated);
  };

  // Generate event dates from formValues
  const eventDays = formValues.to.diff(formValues.from, 'days') + 1;
  const eventDates: string[] = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < eventDays; i++) {
      dates.push(formValues.from.add(i, 'days').format('YYYY-MM-DD'));
    }
    return dates;
  }, [formValues.from, formValues.to, eventDays]);

  // Calculate default hours per day from formValues.days
  const defaultHoursPerDay = useMemo(() => {
    if (!formValues.days || formValues.days.length === 0) return 8;
    const totalHours = formValues.days.reduce((acc, cur) => acc + parseFloat(String(cur || 0)), 0);
    return eventDays > 0 ? totalHours / eventDays : 8;
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
              No budget allocations for this event type. Time allocations require a default allocation type. Money allocations are available for Hack Day and Conference events.
            </Typography>
          </Alert>
        )}
        {!showTimeSection && showMoneySection && (
          <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              No default allocation type set. Set the event type above to enable time allocations.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={1}>
          {showTimeSection && (
            <Grid size={{xs: 12}}>
              <Accordion
                expanded={timeExpanded}
                onChange={(_, isExpanded) => setTimeExpanded?.(isExpanded)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore/>}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {bgcolor: 'action.selected'},
                  }}
                >
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                      <AccountBalance color="action"/>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Time Budget Allocations
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {getTimeSummary()}
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{p: 3}}>
                  <EventTimeAllocationSection
                    eventDates={eventDates}
                    defaultHoursPerDay={defaultHoursPerDay}
                    defaultBudgetType={defaultBudgetType!}
                    participants={timeParticipants}
                    onParticipantsChange={handleTimeParticipantsChange}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
          {showMoneySection && (
            <Grid size={{xs: 12}}>
              <Accordion
                expanded={moneyExpanded}
                onChange={(_, isExpanded) => setMoneyExpanded?.(isExpanded)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore/>}
                  sx={{
                    bgcolor: 'action.hover',
                    '&:hover': {bgcolor: 'action.selected'},
                  }}
                >
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                      <AccountBalance color="action"/>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Money Budget Allocations
                      </Typography>
                    </Box>
                    <Typography variant="caption" color={totalMoneyAllocated > totalBudget ? 'warning.main' : 'text.secondary'}>
                      {getMoneySummary()} — €{totalMoneyAllocated.toLocaleString('nl-NL')} / €{totalBudget.toLocaleString('nl-NL')} allocated
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{p: 3}}>
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
      </AccordionDetails>
    </Accordion>
  );
}
