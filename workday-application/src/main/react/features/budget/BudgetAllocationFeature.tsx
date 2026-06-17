import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { ConfirmDialog } from '@workday-core/components/ConfirmDialog';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { BudgetAllocationClient } from '../../clients/BudgetAllocationClient';
import type { Person } from '../../clients/PersonClient';
import PersonLayout from '../../components/layouts/PersonLayout';
import { useUserMe } from '../../hooks/UserMeHook';
import type {
  BudgetAllocation,
  BudgetAllocationType,
  BudgetSummaryResponse,
} from '../../wirespec/model';
import { BudgetAllocationList } from './BudgetAllocationList';
import { BudgetSummaryCards } from './BudgetSummaryCards';
import { TrainingMoneyAllocationDialog } from './TrainingMoneyAllocationDialog';

export function BudgetAllocationPage() {
  return (
    <PersonLayout requireAuthority={'BudgetAllocationAuthority.ADMIN'}>
      {(person: Person, isAdmin: boolean) => (
        <BudgetAllocationFeature isAdmin={isAdmin} person={person} />
      )}
    </PersonLayout>
  );
}

type BudgetAllocationFeatureProps = {
  person: Person;
  isAdmin: boolean;
};

function useQueryParams() {
  const location = useLocation();
  const history = useHistory();
  const params = new URLSearchParams(location.search);

  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const newParams = new URLSearchParams(location.search);
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) newParams.delete(key);
        else newParams.set(key, value);
      }
      history.replace({ ...location, search: newParams.toString() });
    },
    [history, location],
  );

  return { params, setParams };
}

function BudgetAllocationFeature({
  person,
  isAdmin,
}: BudgetAllocationFeatureProps) {
  const { params, setParams } = useQueryParams();
  const urlYear = params.get('year');
  const urlEventCode = params.get('eventCode');

  const [year, setYearState] = useState(() => {
    const parsed = urlYear ? parseInt(urlYear, 10) : NaN;
    return isNaN(parsed) ? new Date().getFullYear() : parsed;
  });
  const [eventCodeFilter, setEventCodeFilter] = useState<string | null>(
    urlEventCode,
  );
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BudgetAllocation | null>(
    null,
  );
  const [editTarget, setEditTarget] = useState<BudgetAllocation | null>(null);
  const [typeFilter, setTypeFilter] = useState<BudgetAllocationType | null>(
    null,
  );

  const setYear = useCallback(
    (newYear: number) => {
      setYearState(newYear);
      setParams({ year: String(newYear) });
    },
    [setParams],
  );

  const clearEventCodeFilter = useCallback(() => {
    setEventCodeFilter(null);
    setParams({ eventCode: null });
  }, [setParams]);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      BudgetAllocationClient.getSummary(person, year),
      BudgetAllocationClient.findAll(person, year),
    ])
      .then(([summaryData, allocationData]) => {
        setSummary(summaryData);
        setAllocations(allocationData);
      })
      .finally(() => setLoading(false));
  }, [year, person]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      await BudgetAllocationClient.deleteById(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete allocation:', err);
      setDeleteTarget(null);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <Card>
      <CardHeader
        title="Budget Allocation"
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            {isAdmin && (
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Year</InputLabel>
                <Select
                  value={year}
                  label="Year"
                  onChange={(e) => setYear(e.target.value as number)}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {isAdmin && (
              <Button onClick={() => setDialogOpen(true)}>
                <AddIcon /> Add
              </Button>
            )}
          </Stack>
        }
      />
      <CardContent>
        {!loading && <BudgetSummaryCards summary={summary} />}

        {!loading && eventCodeFilter && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              bgcolor: 'info.main',
              color: 'info.contrastText',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2">
              Filtered by event: <strong>{eventCodeFilter}</strong>
            </Typography>
            <Chip
              label="Clear filter"
              size="small"
              onDelete={clearEventCodeFilter}
              onClick={clearEventCodeFilter}
              sx={{ bgcolor: 'background.paper' }}
            />
          </Box>
        )}

        {!loading && allocations.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              label="All"
              variant={typeFilter === null ? 'filled' : 'outlined'}
              color={typeFilter === null ? 'primary' : 'default'}
              onClick={() => setTypeFilter(null)}
            />
            <Chip
              label="Hack Hours"
              variant={typeFilter === 'HACK_TIME' ? 'filled' : 'outlined'}
              color={typeFilter === 'HACK_TIME' ? 'primary' : 'default'}
              onClick={() =>
                setTypeFilter(
                  typeFilter === 'HACK_TIME'
                    ? null
                    : ('HACK_TIME' as BudgetAllocationType),
                )
              }
            />
            <Chip
              label="Training Hours"
              variant={typeFilter === 'TRAINING_TIME' ? 'filled' : 'outlined'}
              color={typeFilter === 'TRAINING_TIME' ? 'primary' : 'default'}
              onClick={() =>
                setTypeFilter(
                  typeFilter === 'TRAINING_TIME'
                    ? null
                    : ('TRAINING_TIME' as BudgetAllocationType),
                )
              }
            />
            <Chip
              label="Training Money"
              variant={typeFilter === 'TRAINING_MONEY' ? 'filled' : 'outlined'}
              color={typeFilter === 'TRAINING_MONEY' ? 'primary' : 'default'}
              onClick={() =>
                setTypeFilter(
                  typeFilter === 'TRAINING_MONEY'
                    ? null
                    : ('TRAINING_MONEY' as BudgetAllocationType),
                )
              }
            />
          </Stack>
        )}

        {!loading && (
          <BudgetAllocationList
            allocations={allocations}
            hasWritePermission={isAdmin}
            onDelete={(allocation) => setDeleteTarget(allocation)}
            onEdit={(allocation) => setEditTarget(allocation)}
            isAdmin={isAdmin}
            typeFilter={typeFilter}
            eventCodeFilter={eventCodeFilter}
          />
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Loading budget details...
            </Typography>
          </Box>
        )}
      </CardContent>

      <TrainingMoneyAllocationDialog
        open={dialogOpen || !!editTarget}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        onSaved={loadData}
        person={isAdmin ? person : undefined}
        editAllocation={editTarget ?? undefined}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      >
        <Typography>
          Are you sure you want to delete this training money allocation?
        </Typography>
      </ConfirmDialog>
    </Card>
  );
}
