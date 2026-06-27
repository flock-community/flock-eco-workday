import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import type { Person } from '../../clients/PersonClient';
import PersonLayout from '../../components/layouts/PersonLayout';
import { BudgetFeature } from './BudgetFeature';

const currentYear = new Date().getFullYear();
const selectableYears = [currentYear, currentYear - 1, currentYear - 2];

export default function BudgetPage() {
  const [year, setYear] = useState(currentYear);

  const yearSelect = (
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
  );

  return (
    <PersonLayout
      requireAuthority={'AggregationAuthority.READ'}
      actions={yearSelect}
    >
      {(person: Person) => <BudgetFeature person={person} year={year} />}
    </PersonLayout>
  );
}
