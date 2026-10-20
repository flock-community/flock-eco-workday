import { Box, Typography } from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import {
  AggregationClient,
  type AggregationHackDay,
} from '../../clients/AggregationClient';
import {
  HackBudgetBar,
  HackBudgetLegend,
  type HackBudgetRow,
  hackBarExtent,
  hackHours,
} from './HackBudgetBar';

type HackDaysPerPersonChartProps = {
  readonly year: number;
};

const toRow = (it: AggregationHackDay): HackBudgetRow => {
  const attended = it.hackHoursUsed ?? 0;
  // Planned holiday is left out until the hack day has passed; until then it still counts as left.
  const holiday =
    (it.holidayOnHackDayHours ?? 0) - (it.upcomingHolidayOnHackDayHours ?? 0);
  const sick = it.sickOnHackDayHours ?? 0;
  return {
    name: it.name,
    budget: it.contractHours,
    attended,
    holiday,
    sick,
    left: Math.max(it.contractHours - attended - holiday - sick, 0),
    upcoming: {
      attended: it.upcomingHackHoursUsed ?? 0,
      holiday: 0,
      sick: it.upcomingSickOnHackDayHours ?? 0,
    },
  };
};

export function HackDaysPerPersonChart({ year }: HackDaysPerPersonChartProps) {
  const [rows, setRows] = useState<HackBudgetRow[] | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    AggregationClient.hackDayReportByYear(
      year || new Date().getFullYear(),
    ).then((res) =>
      setRows(
        res
          .filter((it) => it.contractHours > 0)
          .map(toRow)
          .sort((a, b) => a.left - b.left || a.name.localeCompare(b.name)),
      ),
    );
  }, [year]);

  // Bars share one scale so budgets compare across people.
  const scale = Math.max(1, ...(rows ?? []).map(hackBarExtent));

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
          Hack budget per person
        </Typography>
        <HackBudgetLegend />
      </Box>

      {rows === null ? (
        <AlignedLoader />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(90px, max-content) 1fr auto',
            columnGap: { xs: 1.5, sm: 3 },
            rowGap: 1.75,
            alignItems: 'center',
          }}
        >
          {rows.map((row) => {
            const isHovered = hovered === row.name;
            // Dim every other person so the hovered row stands out.
            const rowProps = {
              onMouseEnter: () => setHovered(row.name),
              onMouseLeave: () => setHovered(null),
            };
            const rowSx = {
              opacity: hovered === null || isHovered ? 1 : 0.35,
              transition: 'opacity 120ms ease',
            };
            const inset = isHovered ? 1 : 4;
            return (
              <Box key={row.name} sx={{ display: 'contents' }}>
                <Typography
                  noWrap
                  title={row.name}
                  {...rowProps}
                  sx={{
                    ...rowSx,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: isHovered ? 700 : 400,
                  }}
                >
                  {row.name}
                </Typography>
                <HackBudgetBar
                  row={row}
                  scale={scale}
                  inset={inset}
                  {...rowProps}
                  sx={rowSx}
                />
                <Typography
                  {...rowProps}
                  sx={{
                    ...rowSx,
                    fontWeight: isHovered ? 700 : 400,
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {hackHours(row.left)} left
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
