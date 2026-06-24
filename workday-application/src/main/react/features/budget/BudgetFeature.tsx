import {
  Alert,
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
import { useUserMe } from '../../hooks/UserMeHook';
import type { BudgetSummaryResponse } from '../../wirespec/model';
import { EventDialog } from '../event/EventDialog';
import { BudgetEventsTable } from './BudgetEventsTable';
import { BudgetSummaryCards } from './BudgetSummaryCards';

const currentYear = new Date().getFullYear();
const selectableYears = [currentYear, currentYear - 1, currentYear - 2];

type BudgetFeatureProps = {
  person: Person;
};

export function BudgetFeature({ person }: BudgetFeatureProps) {
  const [user] = useUserMe();
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);
  const [error, setError] = useState(false);
  const [editCode, setEditCode] = useState<string | undefined>(undefined);

  const canEditEvents = Boolean(
    user?.authorities?.includes('EventAuthority.WRITE'),
  );

  const loadSummary = useCallback(() => {
    setSummary(null);
    setError(false);
    BudgetClient.getSummary(person, year)
      .then(setSummary)
      .catch(() => setError(true));
  }, [person, year]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const handleDialogComplete = () => {
    setEditCode(undefined);
    loadSummary();
  };

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
      {error ? (
        <Alert severity="error">Could not load the budget summary.</Alert>
      ) : (
        <>
          <BudgetSummaryCards summary={summary} />
          {summary && (
            <BudgetEventsTable
              events={summary.events}
              onEditEvent={canEditEvents ? setEditCode : undefined}
            />
          )}
        </>
      )}
      <EventDialog
        open={Boolean(editCode)}
        code={editCode}
        onComplete={handleDialogComplete}
      />
    </Stack>
  );
}
