import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  AttachMoney,
  Calculate,
  Clear,
  Business,
  WarningAmber,
} from '@mui/icons-material';

export interface PersonMoneyAllocation {
  personId: string;
  personName: string;
  amount: number;
}

interface EventMoneyAllocationSectionProps {
  totalBudget: number; // Event costs (total budget)
  participants: PersonMoneyAllocation[];
  flockAmount: number;
  onParticipantsChange: (participants: PersonMoneyAllocation[]) => void;
  onFlockAmountChange: (amount: number) => void;
}

export function EventMoneyAllocationSection({
  totalBudget,
  participants,
  flockAmount,
  onParticipantsChange,
  onFlockAmountChange,
}: EventMoneyAllocationSectionProps) {
  // Calculate totals
  const totalParticipantAllocation = participants.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const totalAllocated = totalParticipantAllocation + flockAmount;
  const remaining = totalBudget - totalAllocated;
  const isOverAllocated = totalAllocated > totalBudget;
  const isFullyAllocated = remaining === 0;

  // Quick actions
  const handleDistributeEqually = () => {
    const amountPerPerson = Math.floor((totalBudget / participants.length) * 100) / 100;
    const updated = participants.map((p) => ({
      ...p,
      amount: amountPerPerson,
    }));
    onParticipantsChange(updated);
    onFlockAmountChange(0); // Clear Flock when distributing equally
    console.log('Distributed money equally:', amountPerPerson, 'per person');
  };

  const handleDistributeRemainder = () => {
    const remainderAfterFlock = totalBudget - flockAmount;
    if (remainderAfterFlock <= 0) {
      console.warn('No remainder to distribute after Flock allocation');
      return;
    }
    const amountPerPerson =
      Math.floor((remainderAfterFlock / participants.length) * 100) / 100;
    const updated = participants.map((p) => ({
      ...p,
      amount: amountPerPerson,
    }));
    onParticipantsChange(updated);
    console.log('Distributed remainder:', amountPerPerson, 'per person');
  };

  const handleClear = () => {
    const updated = participants.map((p) => ({
      ...p,
      amount: 0,
    }));
    onParticipantsChange(updated);
    onFlockAmountChange(0);
    console.log('Cleared all money allocations');
  };

  const handleParticipantAmountChange = (index: number, value: string) => {
    const amount = value ? parseFloat(value) : 0;
    const updated = [...participants];
    updated[index] = { ...updated[index], amount };
    onParticipantsChange(updated);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AttachMoney color="primary" />
          <Typography variant="h6">Money Allocation</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Allocate event budget across participants and Flock. Total must sum to event
          budget (€{totalBudget.toLocaleString('nl-NL')}).
        </Typography>
      </Box>

      {/* Budget Summary */}
      <Alert
        severity={
          isOverAllocated ? 'warning' : isFullyAllocated ? 'success' : 'info'
        }
        icon={isOverAllocated ? <WarningAmber /> : undefined}
        sx={{ mb: 3 }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`Total Budget: €${totalBudget.toLocaleString('nl-NL')}`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Allocated: €${totalAllocated.toLocaleString('nl-NL')}`}
            size="small"
            color={isOverAllocated ? 'warning' : 'default'}
          />
          <Chip
            label={`Remaining: €${Math.abs(remaining).toLocaleString('nl-NL')}${isOverAllocated ? ' over' : ''}`}
            size="small"
            color={
              isOverAllocated
                ? 'error'
                : isFullyAllocated
                  ? 'success'
                  : 'default'
            }
          />
        </Box>
      </Alert>

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
            onClick={handleDistributeEqually}
          >
            Distribute Equally
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Business />}
            onClick={handleDistributeRemainder}
            disabled={flockAmount === 0}
          >
            Distribute Remainder
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Clear />}
            onClick={handleClear}
          >
            Clear All
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Flock Allocation */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Business color="action" />
          <Typography variant="subtitle1" fontWeight="medium">
            Flock Company Allocation
          </Typography>
        </Box>
        <TextField
          label="Amount (€)"
          type="number"
          value={flockAmount || ''}
          onChange={(e) => onFlockAmountChange(parseFloat(e.target.value) || 0)}
          size="small"
          fullWidth
          inputProps={{ min: 0, step: 0.01 }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Participant Allocations */}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Participant Allocations
        </Typography>
        <Stack spacing={2}>
          {participants.map((participant, index) => (
            <Box
              key={participant.personId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="body1" sx={{ flex: 1, fontWeight: 'medium' }}>
                {participant.personName}
              </Typography>
              <TextField
                label="Amount (€)"
                type="number"
                value={participant.amount || ''}
                onChange={(e) =>
                  handleParticipantAmountChange(index, e.target.value)
                }
                size="small"
                sx={{ width: 150 }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
