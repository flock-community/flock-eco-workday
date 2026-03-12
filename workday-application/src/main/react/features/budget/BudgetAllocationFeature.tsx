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
import type {BudgetAllocation, BudgetSummaryResponse} from '../../wirespec/model';

export function BudgetAllocationFeature() {
  const [user] = useUserMe();
  const isAdmin = user?.authorities?.includes('BudgetAllocationAuthority.ADMIN') ?? false;

  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const handlePersonChange = (selected: any) => setSelectedPersonId(selected ?? '');
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(false);

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
    </Card>
  );
}
