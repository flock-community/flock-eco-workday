import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { Business, Calculate } from '@mui/icons-material';

interface EventBudgetFlockSectionProps {
  flockAmount: number;
  onFlockAmountChange: (amount: number) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  totalBudget?: number;
  totalParticipantAllocation: number;
}

export function EventBudgetFlockSection({
  flockAmount,
  onFlockAmountChange,
  description,
  onDescriptionChange,
  totalBudget,
  totalParticipantAllocation,
}: EventBudgetFlockSectionProps) {
  const hasBudget = totalBudget !== undefined && totalBudget > 0;
  const remainingBudget = hasBudget
    ? totalBudget - totalParticipantAllocation - flockAmount
    : 0;

  const handleAssignRemaining = () => {
    if (hasBudget && remainingBudget > 0) {
      onFlockAmountChange(flockAmount + remainingBudget);
      console.log('Assigned remaining budget to Flock:', remainingBudget);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <Business color="action" />
        <Typography variant="subtitle1" fontWeight="medium">
          Flock Company Allocation
        </Typography>
        {flockAmount > 0 && (
          <Chip
            label={`€${flockAmount.toLocaleString('nl-NL')}`}
            size="small"
            color="primary"
          />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Money allocated to the company (not assigned to individual participants)
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            label="Amount (€)"
            type="number"
            value={flockAmount || ''}
            onChange={(e) =>
              onFlockAmountChange(parseFloat(e.target.value) || 0)
            }
            size="small"
            sx={{ flex: 1 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          {hasBudget && remainingBudget > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Calculate />}
              onClick={handleAssignRemaining}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Assign Remaining
            </Button>
          )}
        </Box>

        {hasBudget && remainingBudget > 0 && (
          <Typography variant="caption" color="text.secondary">
            Remaining budget: €{remainingBudget.toLocaleString('nl-NL')}
          </Typography>
        )}

        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          size="small"
          fullWidth
          multiline
          rows={2}
          placeholder="Notes about this Flock allocation"
        />
      </Stack>
    </Paper>
  );
}
