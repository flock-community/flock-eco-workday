import React, {useCallback, useEffect, useState} from 'react';
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
import {BudgetSummaryCards} from './BudgetSummaryCards';
import {BudgetAllocationList} from './BudgetAllocationList';
import {BudgetAllocationClient} from '../../clients/BudgetAllocationClient';
import {EventClient} from '../../clients/EventClient';
import {useUserMe} from '../../hooks/UserMeHook';
import {StudyMoneyAllocationDialog} from './StudyMoneyAllocationDialog';
import {ConfirmDialog} from '@workday-core/components/ConfirmDialog';
import type {BudgetAllocation, BudgetAllocationType, BudgetSummaryResponse} from '../../wirespec/model';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PersonLayout from "../../components/layouts/PersonLayout";
import type {Person} from "../../clients/PersonClient";


export function BudgetAllocationPage() {
  return (
    <PersonLayout requireAuthority={'BudgetAllocationAuthority.ADMIN'}>
      {(person: Person, isAdmin: boolean) => <BudgetAllocationFeature isAdmin={isAdmin} person={person}/>}
    </PersonLayout>
  );
}

type BudgetAllocationFeatureProps = {
  person: Person;
  isAdmin: boolean;
};

function BudgetAllocationFeature({person, isAdmin}: BudgetAllocationFeatureProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BudgetAllocation | null>(null);
  const [editTarget, setEditTarget] = useState<BudgetAllocation | null>(null);
  const [eventNameMap, setEventNameMap] = useState<Record<string, string>>({});
  const [typeFilter, setTypeFilter] = useState<BudgetAllocationType | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      BudgetAllocationClient.getSummary(person, year),
      BudgetAllocationClient.findAll(person, year),
    ])
      .then(([summaryData, allocationData]) => {
        setSummary(summaryData);
        setAllocations(allocationData);

        // Resolve event names from unique event codes
        const eventCodes = [...new Set(allocationData.filter(a => a.eventCode).map(a => a.eventCode!))];
        if (eventCodes.length > 0) {
          Promise.all(eventCodes.map(code => EventClient.get(code).catch(() => null)))
            .then(events => {
              const nameMap: Record<string, string> = {};
              events.forEach((event, i) => {
                if (event) nameMap[eventCodes[i]] = event.description;
              });
              setEventNameMap(nameMap);
            });
        }
      })
      .finally(() => setLoading(false));
  }, [year, person]);

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
            {isAdmin && (
              // Year selector
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
            )}
            {isAdmin && (
              <Button onClick={() => setDialogOpen(true)}>
                <AddIcon/> Add
              </Button>
            )}
          </Stack>
        }
      />
      <CardContent>
        {/* Budget summary cards */}
        {!loading && <BudgetSummaryCards summary={summary}/>}

        {/* Filter chips */}
        {!loading && allocations.length > 0 && (
          <Stack direction="row" spacing={1} sx={{mb: 2}}>
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
              onClick={() => setTypeFilter(typeFilter === 'HACK_TIME' ? null : 'HACK_TIME' as BudgetAllocationType)}
            />
            <Chip
              label="Study Hours"
              variant={typeFilter === 'STUDY_TIME' ? 'filled' : 'outlined'}
              color={typeFilter === 'STUDY_TIME' ? 'primary' : 'default'}
              onClick={() => setTypeFilter(typeFilter === 'STUDY_TIME' ? null : 'STUDY_TIME' as BudgetAllocationType)}
            />
            <Chip
              label="Study Money"
              variant={typeFilter === 'STUDY_MONEY' ? 'filled' : 'outlined'}
              color={typeFilter === 'STUDY_MONEY' ? 'primary' : 'default'}
              onClick={() => setTypeFilter(typeFilter === 'STUDY_MONEY' ? null : 'STUDY_MONEY' as BudgetAllocationType)}
            />
          </Stack>
        )}

        {/* Allocation details */}
        {!loading && (
          <BudgetAllocationList
            allocations={allocations}
            hasWritePermission={isAdmin}
            onDelete={(allocation) => setDeleteTarget(allocation)}
            onEdit={(allocation) => setEditTarget(allocation)}
            isAdmin={isAdmin}
            eventNameMap={eventNameMap}
            typeFilter={typeFilter}
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

      {/* Create/Edit StudyMoney dialog */}
      <StudyMoneyAllocationDialog
        open={dialogOpen || !!editTarget}
        onClose={() => {
          setDialogOpen(false);
          setEditTarget(null);
        }}
        onSaved={refresh}
        person={isAdmin ? person : undefined}
        editAllocation={editTarget ?? undefined}
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
