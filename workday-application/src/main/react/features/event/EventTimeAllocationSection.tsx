import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Alert,
  Chip,
  IconButton,
  Collapse,
  Button,
} from '@mui/material';
import {
  Schedule,
  ExpandMore,
  ExpandLess,
  Info,
  Add,
} from '@mui/icons-material';
import dayjs, { type Dayjs } from 'dayjs';
import type { BudgetAllocationType } from '../budget/mocks/BudgetAllocationTypes';
import { PeriodInput } from '../../components/inputs/PeriodInput';
import { editDay, initDays, type Period } from '../period/Period';

export interface PersonTimeAllocation {
  personId: string;
  personName: string;
  studyPeriod: Period | null; // Study time hours per day, null if no study time
  hackPeriod: Period | null; // Hack time hours per day, null if no hack time
}

interface EventTimeAllocationSectionProps {
  eventDates: string[]; // All dates in event range (ISO strings)
  defaultHoursPerDay: number; // Event's daily hours
  defaultBudgetType: BudgetAllocationType; // Event's default budget type
  participants: PersonTimeAllocation[];
  onParticipantsChange: (participants: PersonTimeAllocation[]) => void;
}

export function EventTimeAllocationSection({
  eventDates,
  defaultHoursPerDay,
  defaultBudgetType,
  participants,
  onParticipantsChange,
}: EventTimeAllocationSectionProps) {
  const [showAll, setShowAll] = useState(false);

  // Convert event dates to Period bounds
  const eventFrom = dayjs(eventDates[0]);
  const eventTo = dayjs(eventDates[eventDates.length - 1]);

  // Check if a participant has any custom allocations (exceptions)
  const hasExceptions = (participant: PersonTimeAllocation): boolean => {
    return participant.studyPeriod !== null || participant.hackPeriod !== null;
  };

  // Get participants with exceptions
  const participantsWithExceptions = participants.filter(hasExceptions);
  const participantsWithDefaults = participants.filter((p) => !hasExceptions(p));

  const displayedParticipants = showAll
    ? participants
    : participantsWithExceptions;

  const handleAddCustomAllocation = (personId: string) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        // Initialize with default hours based on defaultBudgetType
        const defaultPeriod: Period = {
          from: eventFrom,
          to: eventTo,
          days: Array(eventDates.length).fill(defaultHoursPerDay),
        };

        // Initialize empty period for the other type
        const emptyPeriod: Period = {
          from: eventFrom,
          to: eventTo,
          days: Array(eventDates.length).fill(0),
        };

        return {
          ...p,
          studyPeriod: defaultBudgetType === 'STUDY' ? defaultPeriod : emptyPeriod,
          hackPeriod: defaultBudgetType === 'HACK' ? defaultPeriod : emptyPeriod,
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const handleRemoveCustomAllocation = (personId: string) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        return {
          ...p,
          studyPeriod: null,
          hackPeriod: null,
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const handlePeriodChange = (
    personId: string,
    type: 'study' | 'hack',
    date: Dayjs,
    hours: number
  ) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        const periodKey = type === 'study' ? 'studyPeriod' : 'hackPeriod';
        const currentPeriod = p[periodKey];

        // Initialize period if it doesn't exist
        if (!currentPeriod) {
          const basePeriod: Period = {
            from: eventFrom,
            to: eventTo,
            days: Array(eventDates.length).fill(0),
          };
          const newPeriod = editDay(basePeriod, date, hours);
          return {
            ...p,
            [periodKey]: newPeriod,
          };
        }

        const newPeriod = editDay(currentPeriod, date, hours);
        return {
          ...p,
          [periodKey]: newPeriod,
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const getTotalHours = (participant: PersonTimeAllocation): number => {
    let total = 0;

    // Add study hours
    if (participant.studyPeriod?.days) {
      total += participant.studyPeriod.days.reduce((sum, hours) => sum + hours, 0);
    }

    // Add hack hours
    if (participant.hackPeriod?.days) {
      total += participant.hackPeriod.days.reduce((sum, hours) => sum + hours, 0);
    }

    // If no custom allocation, use defaults
    if (!participant.studyPeriod && !participant.hackPeriod) {
      total = eventDates.length * defaultHoursPerDay;
    }

    return total;
  };

  // Validation: check for day overlap and hours exceeding event hours
  const getValidationErrors = (participant: PersonTimeAllocation): string[] => {
    const errors: string[] = [];

    const studyDays = participant.studyPeriod?.days || [];
    const hackDays = participant.hackPeriod?.days || [];

    // Check each day
    eventDates.forEach((_, index) => {
      const studyHours = studyDays[index] || 0;
      const hackHours = hackDays[index] || 0;
      const totalDayHours = studyHours + hackHours;
      const date = eventFrom.add(index, 'days').format('DD MMM YYYY');

      // Check for overlap (both types on same day)
      if (studyHours > 0 && hackHours > 0) {
        errors.push(`${date}: Cannot have both study and hack hours on the same day`);
      }

      // Check for hours exceeding event hours per day
      if (totalDayHours > defaultHoursPerDay) {
        errors.push(
          `${date}: Total hours (${totalDayHours}h) exceeds event hours (${defaultHoursPerDay}h)`
        );
      }
    });

    return errors;
  };

  return (
    < >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Schedule color="primary" />
          <Typography variant="h6">Time Allocation</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          By default, all participants attend for the full event duration (
          {eventDates.length} day{eventDates.length > 1 ? 's' : ''},{' '}
          {defaultHoursPerDay}h/day) with {defaultBudgetType.toLowerCase()} time
          budget. Add exceptions for partial attendance or custom budget types. Time allocations are individual
          and don't sum.
        </Typography>
      </Box>

      {/* Info: Default allocation */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Default:</strong> {defaultHoursPerDay}h/day ({defaultBudgetType}) for{' '}
          {eventDates.length} day{eventDates.length > 1 ? 's' : ''} - applies to all participants unless customized
        </Typography>
      </Alert>

      {/* Toggle to show all */}
      {participantsWithDefaults.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small"
            onClick={() => setShowAll(!showAll)}
            endIcon={showAll ? <ExpandLess /> : <ExpandMore />}
          >
            {showAll
              ? 'Hide participants with defaults'
              : `Show all participants (${participantsWithDefaults.length} hidden)`}
          </Button>
        </Box>
      )}

      {/* Participants List */}
      {displayedParticipants.length === 0 && !showAll && (
        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
          <Typography variant="body2">
            All participants are using default allocation.
          </Typography>
          <Typography variant="caption">
            Click "Show all participants" to add custom allocations.
          </Typography>
        </Box>
      )}

      <Stack spacing={2}>
        {displayedParticipants.map((participant) => (
          <ParticipantTimeRow
            key={participant.personId}
            participant={participant}
            eventFrom={eventFrom}
            eventTo={eventTo}
            eventDates={eventDates}
            totalHours={getTotalHours(participant)}
            validationErrors={getValidationErrors(participant)}
            onAddCustomAllocation={() => handleAddCustomAllocation(participant.personId)}
            onRemoveCustomAllocation={() => handleRemoveCustomAllocation(participant.personId)}
            onPeriodChange={(type, date, hours) =>
              handlePeriodChange(participant.personId, type, date, hours)
            }
          />
        ))}
      </Stack>
    </>
  );
}

interface ParticipantTimeRowProps {
  participant: PersonTimeAllocation;
  eventFrom: Dayjs;
  eventTo: Dayjs;
  eventDates: string[];
  totalHours: number;
  validationErrors: string[];
  onAddCustomAllocation: () => void;
  onRemoveCustomAllocation: () => void;
  onPeriodChange: (type: 'study' | 'hack', date: Dayjs, hours: number) => void;
}

function ParticipantTimeRow({
  participant,
  eventFrom,
  eventTo,
  eventDates,
  totalHours,
  validationErrors,
  onAddCustomAllocation,
  onRemoveCustomAllocation,
  onPeriodChange,
}: ParticipantTimeRowProps) {
  const hasExceptions = participant.studyPeriod !== null || participant.hackPeriod !== null;

  // Create empty period for display when no custom allocation exists
  const getOrCreatePeriod = (type: 'study' | 'hack'): Period => {
    const existing = type === 'study' ? participant.studyPeriod : participant.hackPeriod;
    if (existing) return existing;

    return {
      from: eventFrom,
      to: eventTo,
      days: Array(eventDates.length).fill(0),
    };
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: hasExceptions ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 2,
        bgcolor: hasExceptions ? 'action.hover' : 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: hasExceptions ? 2 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {participant.personName}
          </Typography>
          <Chip label={`${totalHours}h total`} size="small" />
          {!hasExceptions && (
            <Chip
              label="Using defaults"
              size="small"
              variant="outlined"
              color="default"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasExceptions && (
            <>
              <Button
                size="small"
                color="error"
                onClick={onRemoveCustomAllocation}
              >
                Remove Custom
              </Button>
            </>
          )}
          {!hasExceptions && (
            <Button size="small" startIcon={<Add />} onClick={onAddCustomAllocation}>
              Customize
            </Button>
          )}
        </Box>
      </Box>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Validation Errors:
          </Typography>
          {validationErrors.map((error, index) => (
            <Typography key={index} variant="caption" display="block">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Period Inputs */}
      {hasExceptions && (
        <>
          <Stack spacing={3}>
            {/* Study Time Period */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  Study Time
                </Typography>
                {participant.studyPeriod && (
                  <Chip
                    label={`${participant.studyPeriod.days?.reduce((sum, h) => sum + h, 0) || 0}h`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <PeriodInput
                  period={getOrCreatePeriod('study')}
                  onChange={(date, hours) => onPeriodChange('study', date, hours)}
                  readonly={false}
                />
              </Box>
            </Box>

            {/* Hack Time Period */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  Hack Time
                </Typography>
                {participant.hackPeriod && (
                  <Chip
                    label={`${participant.hackPeriod.days?.reduce((sum, h) => sum + h, 0) || 0}h`}
                    size="small"
                    color="secondary"
                  />
                )}
              </Box>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <PeriodInput
                  period={getOrCreatePeriod('hack')}
                  onChange={(date, hours) => onPeriodChange('hack', date, hours)}
                  readonly={false}
                />
              </Box>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" icon={<Info />}>
              <Typography variant="caption">
                Each day can only have hours in either Study Time OR Hack Time, not both.
                Only fill in hours for the event dates ({eventFrom.format('DD MMM')} -{' '}
                {eventTo.format('DD MMM')}).
              </Typography>
            </Alert>
          </Stack>
        </>
      )}
    </Box>
  );
}
