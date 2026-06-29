import { Alert, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { BudgetClient } from '../../clients/BudgetClient';
import type { Person } from '../../clients/PersonClient';
import { useUserMe } from '../../hooks/UserMeHook';
import type { BudgetSummaryResponse } from '../../wirespec/model';
import { EventDialog } from '../event/EventDialog';
import { BudgetEventsTable } from './BudgetEventsTable';
import { BudgetSummaryCards } from './BudgetSummaryCards';

type BudgetFeatureProps = {
  person: Person;
  year: number;
};

export function BudgetFeature({ person, year }: BudgetFeatureProps) {
  const [user] = useUserMe();
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
