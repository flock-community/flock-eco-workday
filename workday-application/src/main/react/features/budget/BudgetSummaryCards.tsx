import React from 'react';
import { Grid } from '@mui/material';
import { BudgetCard } from './BudgetCard';
import { BudgetSummary } from './mocks/BudgetAllocationMocks';

interface BudgetSummaryCardsProps {
  summary: BudgetSummary;
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{xs:12, md:4}}>
        <BudgetCard
          title="Hack Hours"
          budgetItem={summary.hackHours}
          unit="h"
          color="primary"
        />
      </Grid>
      <Grid size={{xs:12, md:4}}>
        <BudgetCard
          title="Study Hours"
          budgetItem={summary.studyHours}
          unit="h"
          color="secondary"
        />
      </Grid>
      <Grid size={{xs:12, md:4}}>
        <BudgetCard
          title="Study Money"
          budgetItem={summary.studyMoney}
          unit="€"
          color="success"
        />
      </Grid>
    </Grid>
  );
}
