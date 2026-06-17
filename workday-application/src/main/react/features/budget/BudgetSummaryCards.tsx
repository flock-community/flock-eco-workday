import { Grid, Skeleton, Stack } from '@mui/material';
import React from 'react';
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
          budgetItem={summary.hackHours}
          unit="h"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetCard
          title="Study Hours"
          budgetItem={summary.studyHours}
          unit="h"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <BudgetCard
          title="Study Money"
          budgetItem={summary.studyMoney}
          unit="€"
        />
      </Grid>
    </Grid>
  );
}
