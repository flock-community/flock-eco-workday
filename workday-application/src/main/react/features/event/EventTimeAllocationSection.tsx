import {
  Add,
  ExpandLess,
  ExpandMore,
  Info,
  Schedule,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { PeriodInput } from '../../components/inputs/PeriodInput';
import type { EventBudgetType } from '../../utils/mappings';
import { editDay, initDays, type Period } from '../period/Period';

export interface PersonTimeAllocation {
  personId: string;
  personName: string;
  trainingPeriod: Period | null; // Training time hours per day, null if no training time
  hackPeriod: Period | null; // Hack time hours per day, null if no hack time
}

interface EventTimeAllocationSectionProps {
  eventDates: string[]; // All dates in event range (ISO strings)
  defaultHoursPerDay: number; // Average hours/day — for display copy only
  eventDayHours: number[]; // Actual hours per day — used for validation and seeding
  defaultBudgetType: EventBudgetType; // Event's default budget type
  participants: PersonTimeAllocation[];
  onParticipantsChange: (participants: PersonTimeAllocation[]) => void;
}

export function EventTimeAllocationSection({
  eventDates,
  defaultHoursPerDay,
  eventDayHours,
  defaultBudgetType,
  participants,
  onParticipantsChange,
}: EventTimeAllocationSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const eventFrom = dayjs(eventDates[0]);
  const eventTo = dayjs(eventDates[eventDates.length - 1]);

  const hasExceptions = (participant: PersonTimeAllocation): boolean => {
    return (
      participant.trainingPeriod !== null || participant.hackPeriod !== null
    );
  };

  const participantsWithExceptions = participants.filter(hasExceptions);
  const participantsWithDefaults = participants.filter(
    (p) => !hasExceptions(p),
  );

  const displayedParticipants = showAll
    ? participants
    : participantsWithExceptions;

  const handleAddCustomAllocation = (personId: string) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        const defaultPeriod: Period = {
          from: eventFrom,
          to: eventTo,
          days: [...eventDayHours],
        };

        return {
          ...p,
          trainingPeriod:
            defaultBudgetType === 'TRAINING' ? defaultPeriod : null,
          hackPeriod: defaultBudgetType === 'HACK' ? defaultPeriod : null,
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
          trainingPeriod: null,
          hackPeriod: null,
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const handlePeriodChange = (
    personId: string,
    type: 'training' | 'hack',
    date: Dayjs,
    hours: number,
  ) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        const periodKey = type === 'training' ? 'trainingPeriod' : 'hackPeriod';
        const currentPeriod = p[periodKey];

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

    if (participant.trainingPeriod?.days) {
      total += participant.trainingPeriod.days.reduce(
        (sum, hours) => sum + hours,
        0,
      );
    }

    if (participant.hackPeriod?.days) {
      total += participant.hackPeriod.days.reduce(
        (sum, hours) => sum + hours,
        0,
      );
    }

    if (!participant.trainingPeriod && !participant.hackPeriod) {
      total = eventDayHours.reduce((s, h) => s + h, 0);
    }

    return total;
  };

  const getValidationErrors = (participant: PersonTimeAllocation): string[] => {
    const errors: string[] = [];

    const trainingDays = participant.trainingPeriod?.days || [];
    const hackDays = participant.hackPeriod?.days || [];

    eventDates.forEach((_, index) => {
      const trainingTimeBudget = trainingDays[index] || 0;
      const hackTimeBudget = hackDays[index] || 0;
      const totalDayHours = trainingTimeBudget + hackTimeBudget;
      const date = eventFrom.add(index, 'days').format('DD MMM YYYY');

      if (trainingTimeBudget < 0 || hackTimeBudget < 0) {
        errors.push(`${date}: Hours cannot be negative`);
      }

      const dayCapHours = eventDayHours[index] ?? defaultHoursPerDay;
      if (totalDayHours > dayCapHours) {
        errors.push(
          `${date}: Total hours (${totalDayHours}h) exceeds event hours (${dayCapHours}h)`,
        );
      }
    });

    return errors;
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Schedule color="primary" />
          <Typography variant="h6">Time Allocation</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          By default, all participants attend for the full event duration (
          {eventDates.length} day{eventDates.length > 1 ? 's' : ''},{' '}
          {defaultHoursPerDay}h/day) with {defaultBudgetType.toLowerCase()} time
          budget. Add exceptions for partial attendance or custom budget types.
          Time allocations are individual and don't sum.
        </Typography>
      </Box>

      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Default:</strong> {defaultHoursPerDay}h/day (
          {defaultBudgetType}) for {eventDates.length} day
          {eventDates.length > 1 ? 's' : ''} - applies to all participants
          unless customized
        </Typography>
      </Alert>

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
            onAddCustomAllocation={() =>
              handleAddCustomAllocation(participant.personId)
            }
            onRemoveCustomAllocation={() =>
              handleRemoveCustomAllocation(participant.personId)
            }
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
  onPeriodChange: (
    type: 'training' | 'hack',
    date: Dayjs,
    hours: number,
  ) => void;
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
  const hasExceptions =
    participant.trainingPeriod !== null || participant.hackPeriod !== null;

  // Create empty period for display when no custom allocation exists
  const getOrCreatePeriod = (type: 'training' | 'hack'): Period => {
    const existing =
      type === 'training' ? participant.trainingPeriod : participant.hackPeriod;
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
            <Button
              size="small"
              startIcon={<Add />}
              onClick={onAddCustomAllocation}
            >
              Customize
            </Button>
          )}
        </Box>
      </Box>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Validation Errors:
          </Typography>
          {validationErrors.map((error) => (
            <Typography key={error} variant="caption" display="block">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}

      {hasExceptions && (
        <Stack spacing={3}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight="medium">
                Training Time
              </Typography>
              {participant.trainingPeriod && (
                <Chip
                  label={`${participant.trainingPeriod.days?.reduce((sum, h) => sum + h, 0) || 0}h`}
                  size="small"
                  color="primary"
                />
              )}
            </Box>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <PeriodInput
                period={getOrCreatePeriod('training')}
                onChange={(date, hours) =>
                  onPeriodChange('training', date, hours)
                }
                readonly={false}
              />
            </Box>
          </Box>

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

          <Alert severity="info" icon={<Info />}>
            <Typography variant="caption">
              A day can mix Training Time and Hack Time hours. Only fill in
              hours for the event dates ({eventFrom.format('DD MMM')} -{' '}
              {eventTo.format('DD MMM')}).
            </Typography>
          </Alert>
        </Stack>
      )}
    </Box>
  );
}
