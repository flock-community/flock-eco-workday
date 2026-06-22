import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { BudgetClient } from '../../clients/BudgetClient';
import type { Person } from '../../clients/PersonClient';
import type { BudgetSummaryResponse } from '../../wirespec/model';
import { BudgetSummaryCards } from './BudgetSummaryCards';

const currentYear = new Date().getFullYear();
const selectableYears = [currentYear, currentYear - 1, currentYear - 2];

type BudgetFeatureProps = {
  person: Person;
};

export function BudgetFeature({ person }: BudgetFeatureProps) {
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);

  const loadSummary = useCallback(() => {
    setSummary(null);
    BudgetClient.getSummary(person, year)
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [person, year]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Typography variant="h6">
          Budget {person.firstname} {person.lastname}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="budget-year-label">Year</InputLabel>
          <Select
            labelId="budget-year-label"
            label="Year"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {selectableYears.map((selectableYear) => (
              <MenuItem key={selectableYear} value={selectableYear}>
                {selectableYear}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <BudgetSummaryCards summary={summary} />
    </Stack>
  );
}
