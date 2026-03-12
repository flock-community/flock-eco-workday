import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
} from '@mui/material';
import type {BudgetItem} from '../../wirespec/model';

interface BudgetCardProps {
  title: string;
  budgetItem: BudgetItem;
  unit: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

function getStatusColor(percentage: number, isOverBudget: boolean) {
  if (isOverBudget) return 'error' as const;
  if (percentage > 75) return 'warning' as const;
  return 'success' as const;
}

function getStatusBgTint(percentage: number, isOverBudget: boolean): string {
  if (isOverBudget) return 'rgba(211, 47, 47, 0.04)';
  if (percentage > 75) return 'rgba(237, 108, 2, 0.04)';
  return 'rgba(46, 125, 50, 0.03)';
}

export function BudgetCard({
  title,
  budgetItem,
  unit,
}: Readonly<BudgetCardProps>) {
  const {budget, used, available} = budgetItem;
  const percentage = budget > 0 ? (used / budget) * 100 : 0;
  const isOverBudget = available < 0;
  const statusColor = getStatusColor(percentage, isOverBudget);

  const formatValue = (value: number): string => {
    if (unit === '\u20AC') {
      return `\u20AC${value.toLocaleString('nl-NL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return `${value}${unit}`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: getStatusBgTint(percentage, isOverBudget),
        transition: 'background-color 0.3s ease',
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>

        <Stack spacing={2}>
          {/* Hero: Available amount */}
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={isOverBudget ? 'error.main' : 'success.main'}
              sx={{lineHeight: 1.2}}
            >
              {formatValue(available)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              available
            </Typography>
          </Box>

          {/* Secondary: Budget / Used */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Typography variant="body2" color="text.secondary">
              Budget: {formatValue(budget)}
            </Typography>
            <Typography
              variant="body2"
              color={isOverBudget ? 'error.main' : 'text.secondary'}
            >
              Used: {formatValue(used)}
            </Typography>
          </Box>

          {/* Progress bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              color={statusColor}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                },
              }}
            />
            <Typography
              variant="caption"
              color={isOverBudget ? 'error' : 'text.secondary'}
              sx={{mt: 0.5, display: 'block', textAlign: 'right'}}
            >
              {percentage.toFixed(0)}% used
              {isOverBudget && ' (over budget!)'}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
