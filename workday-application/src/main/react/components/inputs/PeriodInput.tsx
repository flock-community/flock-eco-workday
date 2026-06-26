import { Box, TextField, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import dayjs, { type Dayjs } from 'dayjs';
import weekOfYearPlugin from 'dayjs/plugin/weekOfYear';
import { Fragment, type ReactNode } from 'react';
import type { Period } from '../../features/period/Period';
import type { DayMeta } from '../../hooks/DayMetaHook';

// utils
import { calcGrid } from '../../utils/calcGrid';

dayjs.extend(weekOfYearPlugin);

const daysOfWeek = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

type GridDay = { key: string; date: Dayjs; disabled: boolean; value: string };

export type PeriodInputProps = {
  period: Period;
  onChange: (day: Dayjs, hours: number) => void;
  dayMeta?: Map<string, DayMeta>;
  weekLabel?: boolean;
  hideWeekTotal?: boolean;
  hidePeriodTotal?: boolean;
  trailingHeader?: ReactNode;
  renderTrailing?: (weekIndex: number) => ReactNode;
  // Insets only the week-label column so day fields stay aligned with an un-inset grid above.
  labelInset?: number;
};

// Background-only fill — green for hackdays, purple for leave (no
// distinction between requested/approved). Green + purple stays distinct
// across deuteranopia, protanopia, and tritanopia.
const HACKDAY_BG = 'rgba(46, 125, 50, 0.16)';
const LEAVE_BG = 'rgba(126, 87, 194, 0.18)';

const backgroundFor = (meta: DayMeta | undefined): string | undefined => {
  if (!meta) return undefined;
  // General events share the hackday colour (green) by request.
  if (meta.hackday || meta.generalEvent) return HACKDAY_BG;
  if (meta.leave) return LEAVE_BG;
  return undefined;
};

const tooltipFor = (meta: DayMeta | undefined): string | undefined => {
  if (!meta) return undefined;
  const parts: string[] = [];
  if (meta.hackday) parts.push(`Hackday: ${meta.hackday.description}`);
  if (meta.generalEvent) parts.push(`Event: ${meta.generalEvent.description}`);
  if (meta.leave) {
    const label = meta.leave.description ?? meta.leave.type;
    const statusLabel = meta.leave.status === 'REQUESTED' ? ' (requested)' : '';
    parts.push(`${label}${statusLabel}`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
};

function DayField({
  day,
  meta,
  onChange,
  fullWidth,
}: {
  day: GridDay;
  meta: DayMeta | undefined;
  onChange: (day: Dayjs, hours: number) => void;
  fullWidth?: boolean;
}) {
  const background = backgroundFor(meta);
  const tooltip = tooltipFor(meta);
  const sx = background
    ? { '& .MuiOutlinedInput-root': { backgroundColor: background } }
    : undefined;
  const field = (
    <TextField
      size="small"
      label={day.disabled ? '-' : day.date.format('DD MMM')}
      value={day.value}
      disabled={day.disabled}
      onChange={(ev) => onChange(day.date, parseFloat(ev.target.value || '0'))}
      type="number"
      sx={sx}
      fullWidth={fullWidth}
    />
  );
  if (!tooltip) return field;
  return (
    <Tooltip title={tooltip} arrow>
      <span style={fullWidth ? { width: '100%', display: 'block' } : undefined}>
        {field}
      </span>
    </Tooltip>
  );
}

export function PeriodInput({
  period,
  onChange,
  dayMeta,
  weekLabel,
  hideWeekTotal,
  hidePeriodTotal,
  trailingHeader,
  renderTrailing,
  labelInset,
}: PeriodInputProps) {
  const grid = calcGrid(period);

  const totalHoursForPeriod = period.days?.reduce(
    (previous, current) => previous + current,
    0,
  );

  const hasTrailing = renderTrailing !== undefined;
  const showWeekTotal = !hideWeekTotal;

  if (weekLabel || hideWeekTotal || hasTrailing) {
    const weekColW = weekLabel ? '72px' : 'minmax(36px, max-content)';
    const rightColW = showWeekTotal ? 'minmax(48px, max-content)' : '120px';
    const template = [weekColW, 'repeat(7, minmax(0, 1fr))', rightColW]
      .filter(Boolean)
      .join(' ');
    const trailingSx = hasTrailing ? { pl: 3 } : undefined;

    return (
      <>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: template,
            columnGap: 1,
            rowGap: 0,
            alignItems: 'stretch',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', pl: labelInset }}>
            {!weekLabel && (
              <Typography variant="body2" color="text.secondary">
                Week
              </Typography>
            )}
          </Box>
          {daysOfWeek.map((d) => (
            <Box
              key={`day-name-${d}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {d}
              </Typography>
            </Box>
          ))}
          {rightColW && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: hasTrailing ? 'flex-start' : 'flex-end',
                ...trailingSx,
              }}
            >
              {hasTrailing && (
                <Typography variant="body2" color="text.secondary">
                  {trailingHeader}
                </Typography>
              )}
              {showWeekTotal && (
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              )}
            </Box>
          )}

          {grid.map((week, weekIndex) => {
            const trailingNode = hasTrailing ? renderTrailing(weekIndex) : null;
            return (
              <Fragment key={`${week.year} week-${week.weekNumber}`}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.75,
                    pl: labelInset,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {weekLabel ? `Week ${week.weekNumber}` : week.weekNumber}
                  </Typography>
                </Box>
                {week.days?.map((day) => (
                  <Box
                    key={`day-${day.key}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 0.75,
                    }}
                  >
                    <DayField
                      day={day}
                      meta={day.disabled ? undefined : dayMeta?.get(day.key)}
                      onChange={onChange}
                      fullWidth
                    />
                  </Box>
                ))}
                {rightColW && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: hasTrailing ? 'stretch' : 'flex-end',
                      py: 0.75,
                      ...trailingSx,
                    }}
                  >
                    {hasTrailing && trailingNode}
                    {showWeekTotal && (
                      <Typography variant="body2">{week.total}</Typography>
                    )}
                  </Box>
                )}
              </Fragment>
            );
          })}
        </Box>
        {!hidePeriodTotal && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 3,
              mt: 1.5,
              pr: 0.5,
            }}
          >
            <Typography color="text.secondary">Period total</Typography>
            <Typography>{totalHoursForPeriod}</Typography>
          </Box>
        )}
      </>
    );
  }

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
            {week.days?.map((day) => (
              <Grid size="grow" key={`day-${day.key}`}>
                <DayField
                  day={day}
                  meta={day.disabled ? undefined : dayMeta?.get(day.key)}
                  onChange={onChange}
                />
              </Grid>
            ))}
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
