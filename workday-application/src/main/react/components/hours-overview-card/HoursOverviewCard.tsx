import { Card, CardContent, CardHeader } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartColors } from '../../theme/chartColors';

type HoursOverviewCardProps = {
  totalPerPersonMe: any;
};

const PCT_SUFFIX = 'Pct';

export function HoursOverviewCard({
  totalPerPersonMe,
}: HoursOverviewCardProps) {
  const colors = useChartColors();
  const referenceColor = useTheme().palette.text.secondary;
  const data = useMemo(() => {
    if (!totalPerPersonMe) return [];

    return Object.keys(totalPerPersonMe)
      .map((monthYear) => ({ ...totalPerPersonMe[monthYear], monthYear }))
      .filter((it) => it !== null)
      .filter((it) => it.assignment > 0)
      .map((it) => {
        const num = (v: unknown) =>
          typeof v === 'number' && !Number.isNaN(v) ? v : 0;
        const submitted =
          num(it.workDays) +
          num(it.leaveDayUsed) +
          num(it.paidLeaveHours) +
          num(it.sickDays) +
          num(it.event) +
          num(it.paidParentalLeaveUsed) +
          num(it.unpaidParentalLeaveUsed);
        const missing = Math.max(0, num(it.total) - submitted);
        const budget = num(it.total);
        const denom = (budget > 0 ? budget : submitted) || 1;
        const pct = (v: unknown) => (num(v) / denom) * 100;
        const row: Record<string, unknown> = {
          ...it,
          submittedPct: pct(submitted),
          workDaysPct: pct(it.workDays),
          leaveDayUsedPct: pct(it.leaveDayUsed),
          paidLeaveHoursPct: pct(it.paidLeaveHours),
          paidParentalLeaveUsedPct: pct(it.paidParentalLeaveUsed),
          unpaidParentalLeaveUsedPct: pct(it.unpaidParentalLeaveUsed),
          sickDaysPct: pct(it.sickDays),
          eventPct: pct(it.event),
        };
        if (missing > 0) {
          row.missing = missing;
          row.missingPct = pct(missing);
        }
        return row;
      })
      .sort((a, b) =>
        (a.monthYear as string).localeCompare(b.monthYear as string),
      )
      .slice(-6)
      .map(
        (it) =>
          ({
            ...it,
            label: new Date(it.monthYear as string).toLocaleString('en-EN', {
              month: 'short',
              year: 'numeric',
            }),
          }) as Record<string, unknown>,
      );
  }, [totalPerPersonMe]);

  const hasMissing = data.some((it) => ((it.missing as number) ?? 0) > 0);
  const maxPct = data.reduce(
    (acc, it) => Math.max(acc, (it.submittedPct as number) ?? 0),
    100,
  );
  const hasOverBudget = maxPct > 100.5;
  const axisMax = hasOverBudget ? Math.ceil(maxPct / 25) * 25 : 100;

  if (!totalPerPersonMe) return <AlignedLoader />;

  if (data.length === 0) {
    return (
      <Card variant={'outlined'}>
        <CardHeader title={'Hours overview'} />
        <CardContent>
          <Typography display={'block'}>No hours data available.</Typography>
        </CardContent>
      </Card>
    );
  }

  const height = 50 + data.length * 50;

  return (
    <Card variant={'outlined'} sx={{ borderRadius: '14px' }}>
      <CardHeader title={'Hours overview'} />
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 24, right: 28, bottom: 0, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, axisMax]}
              tickFormatter={(t) => `${Math.round(t)}%`}
            />
            <YAxis type="category" dataKey="label" width={100} />
            <Tooltip
              formatter={(_value, name, props) => {
                const dataKey = (props as { dataKey?: string }).dataKey ?? '';
                const rawKey = dataKey.endsWith(PCT_SUFFIX)
                  ? dataKey.slice(0, -PCT_SUFFIX.length)
                  : dataKey;
                const raw =
                  (props as { payload?: Record<string, number> }).payload?.[
                    rawKey
                  ] ?? 0;
                return [new Intl.NumberFormat().format(raw), name];
              }}
              filterNull
            />
            <Legend />
            <Bar
              stackId="days"
              dataKey="workDaysPct"
              name="worked hours"
              fill={colors.worked}
            />
            <Bar
              stackId="days"
              dataKey="leaveDayUsedPct"
              name="leave hours"
              fill={colors.leave}
            />
            <Bar
              stackId="days"
              dataKey="paidLeaveHoursPct"
              name="paid leave"
              fill={colors.paidLeave}
            />
            <Bar
              stackId="days"
              dataKey="paidParentalLeaveUsedPct"
              name="paid parental leave"
              fill={colors.paidParentalLeave}
            />
            <Bar
              stackId="days"
              dataKey="unpaidParentalLeaveUsedPct"
              name="unpaid parental leave"
              fill={colors.unpaidParentalLeave}
            />
            <Bar
              stackId="days"
              dataKey="sickDaysPct"
              name="sick hours"
              fill={colors.sick}
            />
            <Bar
              stackId="days"
              dataKey="eventPct"
              name="event hours"
              fill={colors.event}
            />
            {hasMissing && (
              <Bar
                stackId="days"
                dataKey="missingPct"
                name="missing hours"
                fill={colors.missing}
              />
            )}
            {hasOverBudget && (
              <ReferenceLine
                x={100}
                stroke={referenceColor}
                strokeDasharray="4 4"
                label={{
                  value: 'budget',
                  position: 'top',
                  fill: referenceColor,
                  fontSize: 12,
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
