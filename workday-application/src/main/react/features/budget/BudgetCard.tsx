import {
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { BudgetItem } from '../../wirespec/model';

interface BudgetCardProps {
  title: string;
  budgetItem: BudgetItem;
  unit: string;
}

// 'primary' is brand yellow: the healthy gauge fill, escalating only past 75%.
type GaugeColor = 'primary' | 'warning' | 'error';

function gaugeColor(percentage: number, isOverBudget: boolean): GaugeColor {
  if (isOverBudget) return 'error';
  if (percentage > 75) return 'warning';
  return 'primary';
}

export function BudgetCard({
  title,
  budgetItem,
  unit,
}: Readonly<BudgetCardProps>) {
  const { budget, used, available } = budgetItem;
  const hasBudget = budget > 0;
  const percentage = budget > 0 ? (used / budget) * 100 : used > 0 ? 100 : 0;
  const isOverBudget = hasBudget && available < 0;
  const color = gaugeColor(percentage, isOverBudget);

  const formatValue = (value: number): string => {
    if (unit === '€') {
      return `€${value.toLocaleString('nl-NL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    return `${value.toLocaleString('nl-NL', { maximumFractionDigits: 1 })}${unit}`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
          {hasBudget && color !== 'primary' && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: `${color}.main`,
              }}
            />
          )}
        </Stack>

        <Stack spacing={1.75} sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={
                !hasBudget
                  ? 'text.secondary'
                  : isOverBudget
                    ? 'error.main'
                    : 'text.primary'
              }
              sx={{ lineHeight: 1.1 }}
            >
              {hasBudget
                ? formatValue(isOverBudget ? Math.abs(available) : available)
                : 'n/a'}
            </Typography>
            {hasBudget && (
              <Typography
                variant="body2"
                color={isOverBudget ? 'error.main' : 'text.secondary'}
              >
                {isOverBudget ? 'over budget' : 'available'}
              </Typography>
            )}
          </Box>

          {hasBudget ? (
            <Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                color={color}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { borderRadius: 5 },
                }}
              />
              <Box
                sx={{
                  mt: 0.75,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Typography
                  variant="body2"
                  color={isOverBudget ? 'error.main' : 'text.secondary'}
                >
                  {formatValue(used)} of {formatValue(budget)} used
                </Typography>
                <Typography
                  variant="caption"
                  color={isOverBudget ? 'error.main' : 'text.secondary'}
                >
                  {percentage.toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No budget set
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
