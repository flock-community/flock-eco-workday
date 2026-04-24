import { Box, TextField, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import dayjs, { type Dayjs } from 'dayjs';
import weekOfYearPlugin from 'dayjs/plugin/weekOfYear';
import type { Period } from '../../features/period/Period';
import type { DayMeta } from '../../hooks/DayMetaHook';

// utils
import { calcGrid } from '../../utils/calcGrid';

dayjs.extend(weekOfYearPlugin);

const daysOfWeek = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

export type PeriodInputProps = {
  period: Period;
  onChange: (day: Dayjs, hours: number) => void;
  dayMeta?: Map<string, DayMeta>;
};

// Background-only fill — green for hackdays, purple for leave (no
// distinction between requested/approved). Green + purple stays distinct
// across deuteranopia, protanopia, and tritanopia.
const HACKDAY_BG = 'rgba(46, 125, 50, 0.16)';
const LEAVE_BG = 'rgba(126, 87, 194, 0.18)';

const backgroundFor = (meta: DayMeta | undefined): string | undefined => {
  if (!meta) return undefined;
  if (meta.hackday) return HACKDAY_BG;
  if (meta.leave) return LEAVE_BG;
  return undefined;
};

const tooltipFor = (meta: DayMeta | undefined): string | undefined => {
  if (!meta) return undefined;
  const parts: string[] = [];
  if (meta.hackday) parts.push(`Hackday: ${meta.hackday.description}`);
  if (meta.leave) {
    const label = meta.leave.description ?? meta.leave.type;
    const statusLabel = meta.leave.status === 'REQUESTED' ? ' (requested)' : '';
    parts.push(`${label}${statusLabel}`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
};

export function PeriodInput({ period, onChange, dayMeta }: PeriodInputProps) {
  const grid = calcGrid(period);

  const totalHoursForPeriod = period.days?.reduce(
    (previous, current) => previous + current,
    0,
  );

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        {/* The header of the table with the days as caption */}
        <Grid size={{ xs: 2 }}>
          <Typography>Week</Typography>
        </Grid>
        {daysOfWeek.map((d) => (
          <Grid size="grow" textAlign="center" key={`day-name-${d}`}>
            <Typography>{d}</Typography>
          </Grid>
        ))}
        <Grid size={{ xs: 2 }}>
          <Typography align="right">Total</Typography>
        </Grid>
      </Grid>
      {/* End header */}

      {grid.map((week) => {
        return (
          <Grid
            container
            spacing={1}
            mt={1}
            mb={1}
            key={`${week.year} week-${week.weekNumber}`}
            alignItems="center"
            alignContent="center"
          >
            <Grid size={{ xs: 2 }}>
              <Typography>{week.weekNumber}</Typography>
            </Grid>
            {week.days?.map((day) => {
              const meta = day.disabled ? undefined : dayMeta?.get(day.key);
              const background = backgroundFor(meta);
              const tooltip = tooltipFor(meta);
              const sx = background
                ? {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: background,
                    },
                  }
                : undefined;
              const field = (
                <TextField
                  size="small"
                  label={day.disabled ? '-' : day.date.format('DD MMM')}
                  value={day.value}
                  disabled={day.disabled}
                  onChange={(ev) =>
                    onChange(day.date, parseFloat(ev.target.value || '0'))
                  }
                  type="number"
                  sx={sx}
                />
              );
              return (
                <Grid size="grow" key={`day-${day.key}`}>
                  {tooltip ? (
                    <Tooltip title={tooltip} arrow>
                      <span>{field}</span>
                    </Tooltip>
                  ) : (
                    field
                  )}
                </Grid>
              );
            })}
            <Grid size={{ xs: 2 }}>
              <Typography align="right">{week.total}</Typography>
            </Grid>
          </Grid>
        );
      })}

      {/* Bottom */}
      <Box mt={2}>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 10 }}>
            <Typography align="right">Period total</Typography>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <Typography align="right">{totalHoursForPeriod}</Typography>
          </Grid>
        </Grid>
      </Box>
      {/* Endbottom */}
    </>
  );
}
