import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Stack,
} from '@mui/material';
import { BudgetItem } from './mocks/BudgetAllocationMocks';

interface BudgetCardProps {
  title: string;
  budgetItem: BudgetItem;
  unit: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

export function BudgetCard({
  title,
  budgetItem,
  unit,
  color = 'primary',
}: Readonly<BudgetCardProps>) {
  const { budget, used, available } = budgetItem;
  const percentage = budget > 0 ? (used / budget) * 100 : 0;
  const isOverBudget = available < 0;

  const formatValue = (value: number): string => {
    if (unit === '€') {
      return `€${value.toLocaleString('nl-NL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return `${value}${unit}`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

        <Stack spacing={2}>
          {/* Budget values */}
          <Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="baseline"
            >
              <Typography variant="body2" color="text.secondary">
                Budget
              </Typography>
              <Typography variant="h6">{formatValue(budget)}</Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="baseline"
            >
              <Typography variant="body2" color="text.secondary">
                Used
              </Typography>
              <Typography
                variant="h6"
                color={isOverBudget ? 'error' : 'inherit'}
              >
                {formatValue(used)}
              </Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="baseline"
            >
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
              <Typography
                variant="h6"
                color={isOverBudget ? 'error' : 'success.main'}
              >
                {formatValue(available)}
              </Typography>
            </Box>
          </Box>

          {/* Progress bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              color={isOverBudget ? 'error' : color}
              sx={{ height: 8, borderRadius: 1 }}
            />
            <Typography
              variant="caption"
              color={isOverBudget ? 'error' : 'text.secondary'}
              sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}
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
