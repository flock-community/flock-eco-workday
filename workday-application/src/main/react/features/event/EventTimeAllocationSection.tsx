import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Stack,
  Alert,
  Chip,
  IconButton,
  Collapse,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Schedule,
  ExpandMore,
  ExpandLess,
  Info,
  Add,
  Delete,
} from '@mui/icons-material';
import type { BudgetAllocationType } from '../budget/mocks/BudgetAllocationMocks';

export interface DailyTimeOverride {
  date: string;
  hours: number | null; // null = not attending this day
  budgetType: BudgetAllocationType | null; // null = not attending, otherwise STUDY or HACK
}

export interface PersonTimeAllocation {
  personId: string;
  personName: string;
  dailyOverrides: DailyTimeOverride[]; // Only days that differ from default
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

  // Check if a participant has any custom allocations (exceptions)
  const hasExceptions = (participant: PersonTimeAllocation): boolean => {
    return participant.dailyOverrides.length > 0;
  };

  // Get participants with exceptions
  const participantsWithExceptions = participants.filter(hasExceptions);
  const participantsWithDefaults = participants.filter((p) => !hasExceptions(p));

  const displayedParticipants = showAll
    ? participants
    : participantsWithExceptions;

  const handleAddOverride = (personId: string) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        // Add first day as override if no overrides exist
        const firstDate = eventDates[0];
        return {
          ...p,
          dailyOverrides: [
            ...p.dailyOverrides,
            {
              date: firstDate,
              hours: defaultHoursPerDay,
              budgetType: defaultBudgetType,
            },
          ],
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const handleRemoveOverride = (personId: string, overrideIndex: number) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        return {
          ...p,
          dailyOverrides: p.dailyOverrides.filter((_, i) => i !== overrideIndex),
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const handleOverrideChange = (
    personId: string,
    overrideIndex: number,
    field: keyof DailyTimeOverride,
    value: string | number | BudgetAllocationType | null
  ) => {
    const updated = participants.map((p) => {
      if (p.personId === personId) {
        const updatedOverrides = [...p.dailyOverrides];
        updatedOverrides[overrideIndex] = {
          ...updatedOverrides[overrideIndex],
          [field]: value,
        };
        return {
          ...p,
          dailyOverrides: updatedOverrides,
        };
      }
      return p;
    });
    onParticipantsChange(updated);
  };

  const getTotalHours = (participant: PersonTimeAllocation): number => {
    let total = 0;

    eventDates.forEach((date) => {
      const override = participant.dailyOverrides.find((o) => o.date === date);
      if (override) {
        // Use override hours (could be null if not attending)
        total += override.hours || 0;
      } else {
        // Use default
        total += defaultHoursPerDay;
      }
    });

    return total;
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
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
        </Typography>
      </Box>

      {/* Default Info */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`Default: ${defaultHoursPerDay}h/day`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Type: ${defaultBudgetType}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${participantsWithDefaults.length} participant${participantsWithDefaults.length !== 1 ? 's' : ''} using defaults`}
            size="small"
          />
          {participantsWithExceptions.length > 0 && (
            <Chip
              label={`${participantsWithExceptions.length} with custom allocation${participantsWithExceptions.length !== 1 ? 's' : ''}`}
              size="small"
              color="primary"
            />
          )}
        </Box>
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
            eventDates={eventDates}
            defaultHoursPerDay={defaultHoursPerDay}
            defaultBudgetType={defaultBudgetType}
            totalHours={getTotalHours(participant)}
            onAddOverride={() => handleAddOverride(participant.personId)}
            onRemoveOverride={(index) =>
              handleRemoveOverride(participant.personId, index)
            }
            onOverrideChange={(index, field, value) =>
              handleOverrideChange(participant.personId, index, field, value)
            }
          />
        ))}
      </Stack>
    </Paper>
  );
}

interface ParticipantTimeRowProps {
  participant: PersonTimeAllocation;
  eventDates: string[];
  defaultHoursPerDay: number;
  defaultBudgetType: BudgetAllocationType;
  totalHours: number;
  onAddOverride: () => void;
  onRemoveOverride: (index: number) => void;
  onOverrideChange: (
    index: number,
    field: keyof DailyTimeOverride,
    value: string | number | BudgetAllocationType | null
  ) => void;
}

function ParticipantTimeRow({
  participant,
  eventDates,
  defaultHoursPerDay,
  defaultBudgetType,
  totalHours,
  onAddOverride,
  onRemoveOverride,
  onOverrideChange,
}: ParticipantTimeRowProps) {
  const [expanded, setExpanded] = useState(participant.dailyOverrides.length > 0);

  const hasOverrides = participant.dailyOverrides.length > 0;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: hasOverrides ? 'primary.main' : 'divider',
        borderRadius: 1,
        p: 2,
        bgcolor: hasOverrides ? 'primary.50' : 'background.paper',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: hasOverrides ? 2 : 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {participant.personName}
          </Typography>
          <Chip label={`${totalHours}h total`} size="small" />
          {!hasOverrides && (
            <Chip
              label="Using defaults"
              size="small"
              variant="outlined"
              color="default"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasOverrides && (
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
          <Button size="small" startIcon={<Add />} onClick={onAddOverride}>
            {hasOverrides ? 'Add Day' : 'Customize'}
          </Button>
        </Box>
      </Box>

      {/* Daily Overrides */}
      {hasOverrides && (
        <Collapse in={expanded}>
          <Stack spacing={2}>
            {participant.dailyOverrides.map((override, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                }}
              >
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Date</InputLabel>
                  <Select
                    value={override.date}
                    label="Date"
                    onChange={(e) =>
                      onOverrideChange(index, 'date', e.target.value)
                    }
                  >
                    {eventDates.map((date) => (
                      <MenuItem key={date} value={date}>
                        {new Date(date).toLocaleDateString('nl-NL')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Hours"
                  type="number"
                  value={override.hours ?? ''}
                  onChange={(e) =>
                    onOverrideChange(
                      index,
                      'hours',
                      e.target.value ? parseFloat(e.target.value) : null
                    )
                  }
                  size="small"
                  sx={{ width: 100 }}
                  inputProps={{ min: 0, step: 0.5 }}
                  placeholder="Not attending"
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Budget Type</InputLabel>
                  <Select
                    value={override.budgetType ?? ''}
                    label="Budget Type"
                    onChange={(e) =>
                      onOverrideChange(
                        index,
                        'budgetType',
                        (e.target.value as BudgetAllocationType) || null
                      )
                    }
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="STUDY">Study</MenuItem>
                    <MenuItem value="HACK">Hack</MenuItem>
                  </Select>
                </FormControl>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onRemoveOverride(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
}
