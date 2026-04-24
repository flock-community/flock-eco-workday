import { Card, CardContent, CardHeader } from '@mui/material';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type HoursOverviewCardProps = {
  totalPerPersonMe: any;
};

const PCT_SUFFIX = 'Pct';

export function HoursOverviewCard({
  totalPerPersonMe,
}: HoursOverviewCardProps) {
  const data = useMemo(() => {
    if (!totalPerPersonMe) return [];

    return Object.keys(totalPerPersonMe)
      .map((monthYear) => ({ ...totalPerPersonMe[monthYear], monthYear }))
      .filter((it) => it !== null)
      .filter((it) => it.assignment > 0)
      .map((it) => {
        const submitted =
          it.workDays +
          it.leaveDayUsed +
          it.paidLeaveHours +
          it.sickDays +
          it.event +
          it.paidParentalLeaveUsed +
          it.unpaidParentalLeaveUsed;
        const missing = Math.max(0, it.total - submitted);
        const denom = submitted + missing || 1;
        const pct = (v: number) => (v / denom) * 100;
        const row: Record<string, unknown> = {
          ...it,
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

  if (!totalPerPersonMe) return <AlignedLoader />;

  if (data.length === 0) {
    return (
      <Card variant={'outlined'} style={{ borderRadius: 0 }}>
        <CardHeader title={'Hours overview'} />
        <CardContent>
          <Typography display={'block'}>No hours data available.</Typography>
        </CardContent>
      </Card>
    );
  }

  const height = 50 + data.length * 50;

  return (
    <Card variant={'outlined'} style={{ borderRadius: 0 }}>
      <CardHeader title={'Hours overview'} />
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, 100]}
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
              fill="#1de8b5"
            />
            <Bar
              stackId="days"
              dataKey="leaveDayUsedPct"
              name="leave hours"
              fill="#42a5f5"
            />
            <Bar
              stackId="days"
              dataKey="paidLeaveHoursPct"
              name="paid leave"
              fill="#AB47BC"
            />
            <Bar
              stackId="days"
              dataKey="paidParentalLeaveUsedPct"
              name="paid parental leave"
              fill="#FFB6C1"
            />
            <Bar
              stackId="days"
              dataKey="unpaidParentalLeaveUsedPct"
              name="unpaid parental leave"
              fill="#87CEFA"
            />
            <Bar
              stackId="days"
              dataKey="sickDaysPct"
              name="sick hours"
              fill="#ef5350"
            />
            <Bar
              stackId="days"
              dataKey="eventPct"
              name="event hours"
              fill="#fed766"
            />
            {hasMissing && (
              <Bar
                stackId="days"
                dataKey="missingPct"
                name="missing hours"
                fill="#9e9e9e"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
