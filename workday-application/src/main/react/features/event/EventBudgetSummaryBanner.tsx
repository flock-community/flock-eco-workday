import React from 'react';
import { Alert, Box, Typography, Chip } from '@mui/material';
import { Info, CheckCircle, Warning } from '@mui/icons-material';

interface EventBudgetSummaryBannerProps {
  totalBudget?: number;
  totalAllocated: number;
  totalTime?: number;
  currency?: string;
  // New props for collapsed summary view
  participantCount?: number;
  defaultHoursPerDay?: number;
  defaultBudgetType?: string | null;
  hasUnsavedChanges?: boolean;
}

export function EventBudgetSummaryBanner({
  totalBudget,
  totalAllocated,
  totalTime,
  currency = '€',
  participantCount,
  defaultHoursPerDay,
  defaultBudgetType,
  hasUnsavedChanges,
}: EventBudgetSummaryBannerProps) {
  const hasBudget = totalBudget !== undefined && totalBudget > 0;
  const remaining = hasBudget ? totalBudget - totalAllocated : 0;
  const isOverBudget = hasBudget && totalAllocated > totalBudget;
  const isExact = hasBudget && totalAllocated === totalBudget;

  // Detect if this is used as a collapsed summary (for AccordionSummary)
  const isCollapsedMode = participantCount !== undefined;

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

  // Collapsed summary view for AccordionSummary
  if (isCollapsedMode) {
    const moneyPerPerson = participantCount > 0 ? totalBudget! / participantCount : 0;

    // Only show sections that have actual content
    const hasTimeSection = defaultBudgetType !== null && defaultBudgetType !== undefined;
    const hasMoneySection = hasBudget;

    // Build summary text
    let summaryText = `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;

    if (hasTimeSection && hasMoneySection) {
      summaryText += ` × ${defaultHoursPerDay?.toFixed(0)}h/day ${defaultBudgetType}, ${currency}${moneyPerPerson.toFixed(0)}/person`;
    } else if (hasMoneySection) {
      summaryText += `, ${currency}${moneyPerPerson.toFixed(0)}/person`;
    } else if (hasTimeSection) {
      summaryText += ` × ${defaultHoursPerDay?.toFixed(0)}h/day ${defaultBudgetType}`;
    } else {
      summaryText += ' - no budget allocations for this event type';
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: '100%', pr: 1 }}>
        {hasUnsavedChanges && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              flexShrink: 0,
            }}
          />
        )}
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {summaryText}
        </Typography>
        {(hasMoneySection || hasTimeSection) && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {hasBudget && (
              <>
                <Chip
                  label={`Budget: ${currency}${totalBudget?.toLocaleString('nl-NL')}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Allocated: ${currency}${totalAllocated.toLocaleString('nl-NL')}`}
                  size="small"
                  color={isOverBudget ? 'warning' : 'default'}
                />
              </>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // Expanded detail view (original Alert-based design)
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
