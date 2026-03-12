import React, {useCallback, useEffect, useState} from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {BudgetSummaryCards} from './BudgetSummaryCards';
import {BudgetAllocationList} from './BudgetAllocationList';
import {BudgetAllocationClient} from '../../clients/BudgetAllocationClient';
import {useUserMe} from '../../hooks/UserMeHook';
import {PersonSelector} from '../../components/selector/PersonSelector';
import {StudyMoneyAllocationDialog} from './StudyMoneyAllocationDialog';
import {ConfirmDialog} from '@workday-core/components/ConfirmDialog';
import type {BudgetAllocation, BudgetSummaryResponse} from '../../wirespec/model';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

export function BudgetAllocationFeature() {
  const [user] = useUserMe();
  const isAdmin = user?.authorities?.includes('BudgetAllocationAuthority.ADMIN') ?? false;

  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const handlePersonChange = (selected: any) => setSelectedPersonId(selected ?? '');
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BudgetAllocation | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    const personId = isAdmin && selectedPersonId !== '' ? selectedPersonId : undefined;
    Promise.all([
      BudgetAllocationClient.getSummary(personId, year),
      BudgetAllocationClient.findAll(personId, year),
    ])
      .then(([summaryData, allocationData]) => {
        setSummary(summaryData);
        setAllocations(allocationData);
      })
      .finally(() => setLoading(false));
  }, [year, selectedPersonId, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    try {
      await BudgetAllocationClient.deleteById(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      console.error('Failed to delete allocation:', err);
      setDeleteTarget(null);
    }
  };

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <Card>
      <CardHeader
        title="Budget Allocation"
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Year selector */}
            <FormControl size="small" sx={{minWidth: 100}}>
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

            {/* Person selector (admin only) */}
            {isAdmin && (
              <PersonSelector
                embedded
                value={selectedPersonId}
                onChange={handlePersonChange}
                label="Person"
                size="small"
                sx={{minWidth: 200}}
              />
            )}

            {isAdmin && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => setDialogOpen(true)}
              >
                Add Study Money
              </Button>
            )}
          </Stack>
        }
      />
      <CardContent>
        {/* Budget summary cards */}
        {!loading && <BudgetSummaryCards summary={summary} />}

        {/* Allocation details */}
        {!loading && (
          <BudgetAllocationList
            allocations={allocations}
            hasWritePermission={isAdmin}
            onDelete={(allocation) => setDeleteTarget(allocation)}
          />
        )}

        {/* Loading state */}
        {loading && (
          <Box sx={{textAlign: 'center', py: 4}}>
            <Typography variant="body1" color="text.secondary">
              Loading budget details...
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Create StudyMoney dialog */}
      <StudyMoneyAllocationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={refresh}
        personId={isAdmin ? selectedPersonId : undefined}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      >
        Are you sure you want to delete this study money allocation?
      </ConfirmDialog>
    </Card>
  );
}
