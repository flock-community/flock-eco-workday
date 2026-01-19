import React from 'react';
import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import { Calculate, AttachMoney } from '@mui/icons-material';
import {
  EventBudgetParticipantRow,
  type ParticipantAllocation,
} from './EventBudgetParticipantRow';
import type { BudgetAllocationType } from '../budget/mocks/BudgetAllocationMocks';

interface EventBudgetParticipantListProps {
  participants: ParticipantAllocation[];
  onParticipantChange: (index: number, allocation: ParticipantAllocation) => void;
  defaultAllocationType: BudgetAllocationType;
  eventDuration: number; // Total hours based on event date range
  totalBudget?: number;
  // Budget info per person (simplified for Phase 1 - assume same for all)
  availableStudyHours: number;
  availableHackHours: number;
  availableStudyMoney: number;
}

export function EventBudgetParticipantList({
  participants,
  onParticipantChange,
  defaultAllocationType,
  eventDuration,
  totalBudget,
  availableStudyHours,
  availableHackHours,
  availableStudyMoney,
}: EventBudgetParticipantListProps) {
  const handleDivideTimeEqually = () => {
    const hoursPerPerson = eventDuration;
    const updatedParticipants = participants.map((p) => ({
      ...p,
      totalHours: hoursPerPerson,
      allocationType: p.allocationType || defaultAllocationType,
      dailyTimeAllocations: p.dailyTimeAllocations || [],
    }));

    updatedParticipants.forEach((p, index) => {
      onParticipantChange(index, p);
    });

    console.log('Divided time equally:', hoursPerPerson, 'hours per person');
  };

  const handleDivideMoneyEqually = () => {
    if (!totalBudget || totalBudget <= 0) {
      console.warn('No total budget set for event');
      return;
    }

    // Calculate current Flock allocation (simplified - would need to be passed in)
    const participantCount = participants.length;
    const moneyPerPerson = Math.floor(totalBudget / participantCount / 10) * 10; // Round down to nearest 10

    const updatedParticipants = participants.map((p) => ({
      ...p,
      amount: moneyPerPerson,
      files: p.files || [],
    }));

    updatedParticipants.forEach((p, index) => {
      onParticipantChange(index, p);
    });

    console.log('Divided money equally:', moneyPerPerson, 'per person');
  };

  if (participants.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No participants added to this event yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            startIcon={<Calculate />}
            onClick={handleDivideTimeEqually}
          >
            Divide Time Equally
          </Button>
          {totalBudget && totalBudget > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AttachMoney />}
              onClick={handleDivideMoneyEqually}
            >
              Divide Money Equally
            </Button>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Participant List */}
      <Typography variant="subtitle2" gutterBottom>
        Participants ({participants.length})
      </Typography>

      <Box>
        {participants.map((participant, index) => (
          <EventBudgetParticipantRow
            key={participant.personId}
            allocation={participant}
            onChange={(updated) => onParticipantChange(index, updated)}
            availableStudyHours={availableStudyHours}
            availableHackHours={availableHackHours}
            availableStudyMoney={availableStudyMoney}
            defaultAllocationType={defaultAllocationType}
          />
        ))}
      </Box>
    </Box>
  );
}
