import { Box, type BoxProps, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useChartColors } from '../../theme/chartColors';

export type HackBudgetSegmentKey = 'attended' | 'holiday' | 'sick';

export type HackBudgetRow = {
  name: string;
  budget: number;
  attended: number;
  holiday: number;
  sick: number;
  left: number;
  // The part of attended, holiday and sick on hack days from today on; these can still be cancelled.
  upcoming: Record<HackBudgetSegmentKey, number>;
};

type Segment = {
  key: HackBudgetSegmentKey;
  label: string;
  color: string;
};

export const hackHours = (value: number) =>
  value.toLocaleString('nl-NL', { maximumFractionDigits: 1 });

export const hackDays = (value: number) => {
  const d = value / 8;
  return `${d.toLocaleString('nl-NL', { maximumFractionDigits: 1 })} ${d === 1 ? 'day' : 'days'}`;
};

// Hack days still ahead are hatched so they read apart from the ones that already passed.
const upcomingFill = (color: string) =>
  `repeating-linear-gradient(-45deg, ${color} 0 3px, ${alpha(color, 0.35)} 3px 6px)`;

const passed = (row: HackBudgetRow, key: HackBudgetSegmentKey) =>
  row[key] - row.upcoming[key];

export const hackUpcomingTotal = (row: HackBudgetRow) =>
  row.upcoming.attended + row.upcoming.holiday + row.upcoming.sick;

/** The total a bar needs room for: its budget, or more when it went over. */
export const hackBarExtent = (row: HackBudgetRow) =>
  Math.max(row.budget, row.attended + row.holiday + row.sick);

function useSegments(): readonly Segment[] {
  const colors = useChartColors();
  return [
    { key: 'attended', label: 'Hack days attended', color: colors.worked },
    {
      key: 'holiday',
      label: 'Holiday on hack days',
      color: colors.hackHoliday,
    },
    { key: 'sick', label: 'Sick on hack days', color: colors.hackSick },
  ];
}

function Breakdown({
  row,
  segments,
}: Readonly<{ row: HackBudgetRow; segments: readonly Segment[] }>) {
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
              {hackDays(passed(row, s.key))}
            </Box>
            <Box sx={{ fontWeight: 600, textAlign: 'right' }}>
              {s.key === 'holiday' ? '–' : hackDays(row.upcoming[s.key])}
            </Box>
            <Box sx={{ opacity: 0.7, textAlign: 'right' }}>
              {hackHours(row[s.key])}h
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
        <Box sx={{ fontWeight: 600, textAlign: 'right' }}>
          {hackDays(row.left)}
        </Box>
        <Box sx={{ opacity: 0.7, textAlign: 'right' }}>
          {hackHours(row.left)}h
        </Box>
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
        <span>{hackDays(row.holiday + row.sick)}</span>
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
        <span>{hackDays(hackUpcomingTotal(row))}</span>
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
          {hackDays(row.budget)} ({hackHours(row.budget)}h)
        </span>
      </Box>
    </Box>
  );
}

export function HackBudgetLegend() {
  const colors = useChartColors();
  const segments = useSegments();
  return (
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
  );
}

type HackBudgetBarProps = Omit<BoxProps, 'children'> & {
  row: HackBudgetRow;
  // Hours that span the full width, so several bars can share one scale.
  scale?: number;
  // Gap between the bar and the top and bottom of its track.
  inset?: number;
};

export function HackBudgetBar({
  row,
  scale = hackBarExtent(row),
  inset = 4,
  sx,
  ...props
}: Readonly<HackBudgetBarProps>) {
  const colors = useChartColors();
  const segments = useSegments();
  const pct = (value: number) => `${(value / Math.max(scale, 1)) * 100}%`;
  let offset = 0;
  return (
    <Tooltip
      arrow
      placement="top"
      slotProps={{ tooltip: { sx: { maxWidth: 'none' } } }}
      title={<Breakdown row={row} segments={segments} />}
    >
      <Box
        {...props}
        sx={[
          { position: 'relative', height: 26, cursor: 'default' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
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
              phase === 'passed' ? passed(row, s.key) : row.upcoming[s.key];
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
  );
}
