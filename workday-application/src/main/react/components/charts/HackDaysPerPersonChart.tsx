import { Box, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  // The part of attended, holiday and sick on hack days from today on; these can still be cancelled.
  upcoming: Record<Segment['key'], number>;
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

// Hack days still ahead are hatched so they read apart from the ones that already passed.
const upcomingFill = (color: string) =>
  `repeating-linear-gradient(-45deg, ${color} 0 3px, ${alpha(color, 0.35)} 3px 6px)`;

const passed = (row: Row, key: Segment['key']) => row[key] - row.upcoming[key];

const upcomingTotal = (row: Row) =>
  row.upcoming.attended + row.upcoming.holiday + row.upcoming.sick;

function Breakdown({
  row,
  segments,
}: Readonly<{ row: Row; segments: readonly Segment[] }>) {
  const columns = '10px 1fr auto auto 44px';
  return (
    <Box sx={{ p: 0.5, minWidth: 300 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
        {row.name}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: columns,
          columnGap: 1,
          rowGap: 0.5,
          alignItems: 'center',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        <Box />
        <Box />
        <Box sx={{ opacity: 0.7, textAlign: 'right' }}>Passed</Box>
        <Box sx={{ opacity: 0.7, textAlign: 'right' }}>Upcoming</Box>
        <Box />
        {segments.map((s) => (
          <Box key={s.key} sx={{ display: 'contents' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                bgcolor: s.color,
              }}
            />
            <Box>{s.label}</Box>
            <Box sx={{ fontWeight: 600, textAlign: 'right' }}>
              {days(passed(row, s.key))}
            </Box>
            <Box sx={{ fontWeight: 600, textAlign: 'right' }}>
              {s.key === 'holiday' ? '–' : days(row.upcoming[s.key])}
            </Box>
            <Box sx={{ opacity: 0.7, textAlign: 'right' }}>
              {hours(row[s.key])}h
            </Box>
          </Box>
        ))}
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '2px',
            border: '1px solid currentColor',
          }}
        />
        <Box>Left</Box>
        <Box />
        <Box sx={{ fontWeight: 600, textAlign: 'right' }}>{days(row.left)}</Box>
        <Box sx={{ opacity: 0.7, textAlign: 'right' }}>{hours(row.left)}h</Box>
      </Box>
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
        <span>Can still be cancelled</span>
        <span>{days(upcomingTotal(row))}</span>
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
  const colors = useChartColors();
  const [rows, setRows] = useState<Row[] | null>(null);
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={(theme) => ({
                width: 12,
                height: 12,
                borderRadius: '2px',
                backgroundImage: upcomingFill(theme.palette.text.secondary),
              })}
            />
            Upcoming, can still be cancelled
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
                <Tooltip
                  arrow
                  placement="top"
                  slotProps={{ tooltip: { sx: { maxWidth: 'none' } } }}
                  title={<Breakdown row={row} segments={segments} />}
                >
                  <Box
                    {...rowProps}
                    sx={{
                      ...rowSx,
                      position: 'relative',
                      height: 26,
                      cursor: 'default',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: inset,
                        bottom: inset,
                        transition: 'top 120ms ease, bottom 120ms ease',
                        left: 0,
                        width: pct(row.budget),
                        bgcolor: colors.available,
                      }}
                    />
                    {/* Everything that passed comes first, then what is still ahead, so the split reads as a timeline. */}
                    {(['passed', 'upcoming'] as const).flatMap((phase) =>
                      segments.map((s) => {
                        const value =
                          phase === 'passed'
                            ? passed(row, s.key)
                            : row.upcoming[s.key];
                        const left = offset;
                        offset += value;
                        return value > 0 ? (
                          <Box
                            key={`${phase}-${s.key}`}
                            sx={{
                              position: 'absolute',
                              top: inset,
                              bottom: inset,
                              transition: 'top 120ms ease, bottom 120ms ease',
                              left: pct(left),
                              width: pct(value),
                              ...(phase === 'passed'
                                ? { bgcolor: s.color }
                                : { backgroundImage: upcomingFill(s.color) }),
                            }}
                          />
                        ) : null;
                      }),
                    )}
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
