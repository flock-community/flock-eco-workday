import { Grid, Skeleton } from '@mui/material';
import type { BudgetSummaryResponse } from '../../wirespec/model';
import { BudgetCard } from './BudgetCard';

interface BudgetSummaryCardsProps {
  summary: BudgetSummaryResponse | null;
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
  if (!summary) {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
            <Skeleton
              variant="rectangular"
              height={180}
              sx={{ borderRadius: 1 }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetCard
          title="Hack Hours"
          budgetItem={summary.hackTimeBudget}
          unit="h"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetCard
          title="Training Hours"
          budgetItem={summary.trainingTimeBudget}
          unit="h"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetCard
          title="Training Money"
          budgetItem={summary.trainingMoneyBudget}
          unit="€"
        />
      </Grid>
    </Grid>
  );
}
