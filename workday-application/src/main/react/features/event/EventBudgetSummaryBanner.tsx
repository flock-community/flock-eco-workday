import React from 'react';
import { Alert, Box, Typography, Chip } from '@mui/material';
import { Info, CheckCircle, Warning } from '@mui/icons-material';

interface EventBudgetSummaryBannerProps {
  totalBudget?: number;
  totalAllocated: number;
  totalTime?: number;
  currency?: string;
}

export function EventBudgetSummaryBanner({
  totalBudget,
  totalAllocated,
  totalTime,
  currency = '€',
}: EventBudgetSummaryBannerProps) {
  const hasBudget = totalBudget !== undefined && totalBudget > 0;
  const remaining = hasBudget ? totalBudget - totalAllocated : 0;
  const isOverBudget = hasBudget && totalAllocated > totalBudget;
  const isExact = hasBudget && totalAllocated === totalBudget;

  const getSeverity = () => {
    if (!hasBudget) return 'info';
    if (isOverBudget) return 'warning';
    if (isExact) return 'success';
    return 'info';
  };

  const getIcon = () => {
    if (!hasBudget) return <Info />;
    if (isOverBudget) return <Warning />;
    if (isExact) return <CheckCircle />;
    return <Info />;
  };

  return (
    <Alert severity={getSeverity()} icon={getIcon()} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" fontWeight="medium">
          Budget Summary
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {hasBudget && (
            <Chip
              label={`Total Budget: ${currency}${totalBudget.toLocaleString('nl-NL')}`}
              size="small"
              variant="outlined"
            />
          )}
          <Chip
            label={`Allocated: ${currency}${totalAllocated.toLocaleString('nl-NL')}`}
            size="small"
            color={isOverBudget ? 'warning' : 'default'}
          />
          {hasBudget && (
            <Chip
              label={`Remaining: ${currency}${Math.abs(remaining).toLocaleString('nl-NL')}${isOverBudget ? ' over' : ''}`}
              size="small"
              color={isOverBudget ? 'error' : isExact ? 'success' : 'default'}
            />
          )}
          {totalTime !== undefined && totalTime > 0 && (
            <Chip
              label={`Total Time: ${totalTime}h`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {isOverBudget && (
          <Typography variant="caption" color="warning.main">
            The allocated amount exceeds the total budget by {currency}
            {Math.abs(remaining).toLocaleString('nl-NL')}
          </Typography>
        )}
        {isExact && (
          <Typography variant="caption" color="success.main">
            Budget fully allocated
          </Typography>
        )}
      </Box>
    </Alert>
  );
}
