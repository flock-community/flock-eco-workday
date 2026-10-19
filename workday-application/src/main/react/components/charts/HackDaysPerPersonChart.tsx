import { Box, Tooltip, Typography } from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import {
  AggregationClient,
  type AggregationHackDay,
} from '../../clients/AggregationClient';
import { useChartColors } from '../../theme/chartColors';

type HackDaysPerPersonChartProps = {
  readonly year: number;
};

type Row = {
  name: string;
  budget: number;
  attended: number;
  holiday: number;
  sick: number;
  left: number;
};

const hours = (value: number) =>
  value.toLocaleString('nl-NL', { maximumFractionDigits: 1 });

const days = (value: number) => {
  const d = value / 8;
  return `${d.toLocaleString('nl-NL', { maximumFractionDigits: 1 })} ${d === 1 ? 'day' : 'days'}`;
};

type Segment = {
  key: 'attended' | 'holiday' | 'sick';
  label: string;
  color: string;
};

function Breakdown({
  row,
  segments,
}: Readonly<{ row: Row; segments: readonly Segment[] }>) {
  const lines = [
    ...segments,
    { key: 'left', label: 'Left', color: undefined },
  ] as const;
  return (
    <Box sx={{ p: 0.5, minWidth: 220 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
        {row.name}
      </Typography>
      {lines.map((line) => (
        <Box
          key={line.key}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '2px',
              bgcolor: line.color ?? 'transparent',
              border: line.color ? 'none' : '1px solid currentColor',
            }}
          />
          <Box sx={{ flex: 1 }}>{line.label}</Box>
          <Box sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {days(row[line.key])}
          </Box>
          <Box sx={{ opacity: 0.7, width: 44, textAlign: 'right' }}>
            {hours(row[line.key])}h
          </Box>
        </Box>
      ))}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          mt: 0.75,
          pt: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
          opacity: 0.85,
        }}
      >
        <span>Missed (holiday + sick)</span>
        <span>{days(row.holiday + row.sick)}</span>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          opacity: 0.85,
        }}
      >
        <span>Budget</span>
        <span>
          {days(row.budget)} ({hours(row.budget)}h)
        </span>
      </Box>
    </Box>
  );
}

const toRow = (it: AggregationHackDay): Row => {
  const attended = it.hackHoursUsed ?? 0;
  const holiday = it.holidayOnHackDayHours ?? 0;
  const sick = it.sickOnHackDayHours ?? 0;
  return {
    name: it.name,
    budget: it.contractHours,
    attended,
    holiday,
    sick,
    left: Math.max(it.contractHours - attended - holiday - sick, 0),
  };
};

export function HackDaysPerPersonChart({ year }: HackDaysPerPersonChartProps) {
  const colors = useChartColors();
  const [rows, setRows] = useState<Row[] | null>(null);

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

  const segments: readonly Segment[] = [
    { key: 'attended', label: 'Hack days attended', color: colors.worked },
    {
      key: 'holiday',
      label: 'Holiday on hack days',
      color: colors.hackHoliday,
    },
    { key: 'sick', label: 'Sick on hack days', color: colors.hackSick },
  ];

  // Bars share one scale so budgets compare across people.
  const scale = Math.max(
    1,
    ...(rows ?? []).map((r) =>
      Math.max(r.budget, r.attended + r.holiday + r.sick),
    ),
  );
  const pct = (value: number) => `${(value / scale) * 100}%`;

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
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: 2,
            rowGap: 0.5,
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          {[
            ...segments,
            { key: 'left', label: 'Left', color: colors.available },
          ].map((it) => (
            <Box
              key={it.key}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  bgcolor: it.color,
                }}
              />
              {it.label}
            </Box>
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 2, height: 14, bgcolor: 'text.primary' }} />
            Budget
          </Box>
        </Box>
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
            let offset = 0;
            return (
              <Box key={row.name} sx={{ display: 'contents' }}>
                <Typography
                  noWrap
                  title={row.name}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  {row.name}
                </Typography>
                <Tooltip
                  arrow
                  placement="top"
                  title={<Breakdown row={row} segments={segments} />}
                >
                  <Box
                    sx={{ position: 'relative', height: 26, cursor: 'default' }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        bottom: 4,
                        left: 0,
                        width: pct(row.budget),
                        bgcolor: colors.available,
                      }}
                    />
                    {segments.map((s) => {
                      const left = offset;
                      offset += row[s.key];
                      return row[s.key] > 0 ? (
                        <Box
                          key={s.key}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            bottom: 4,
                            left: pct(left),
                            width: pct(row[s.key]),
                            bgcolor: s.color,
                          }}
                        />
                      ) : null;
                    })}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: pct(row.budget),
                        width: 2,
                        ml: '-1px',
                        bgcolor: 'text.primary',
                      }}
                    />
                  </Box>
                </Tooltip>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {hours(row.left)} left
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
