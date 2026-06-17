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
import { useChartColors } from '../../theme/chartColors';

type HoursOverviewCardProps = {
  totalPerPersonMe: any;
};

export function HoursOverviewCard({
  totalPerPersonMe,
}: HoursOverviewCardProps) {
  const colors = useChartColors();
  const data = useMemo(() => {
    if (!totalPerPersonMe) return [];

    return Object.keys(totalPerPersonMe)
      .map((monthYear) => ({ ...totalPerPersonMe[monthYear], monthYear }))
      .filter((it) => it !== null)
      .filter((it) => it.assignment > 0)
      .map((it) => ({
        ...it,
        missing: Math.max(
          0,
          it.total -
            (it.workDays +
              it.leaveDayUsed +
              it.paidLeaveHours +
              it.sickDays +
              it.event +
              it.paidParentalLeaveUsed +
              it.unpaidParentalLeaveUsed),
        ),
      }))
      .sort((a, b) => a.monthYear.localeCompare(b.monthYear))
      .slice(-6)
      .map((it) => ({
        ...it,
        label: new Date(it.monthYear).toLocaleString('en-EN', {
          month: 'short',
          year: 'numeric',
        }),
      }));
  }, [totalPerPersonMe]);

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
            <XAxis type="number" />
            <YAxis type="category" dataKey="label" width={100} />
            <Tooltip
              // @ts-expect-error
              formatter={(value) => new Intl.NumberFormat().format(value)}
            />
            <Legend />
            <Bar
              stackId="days"
              dataKey="workDays"
              name="worked hours"
              fill={colors.worked}
            />
            <Bar
              stackId="days"
              dataKey="leaveDayUsed"
              name="leave hours"
              fill={colors.leave}
            />
            <Bar
              stackId="days"
              dataKey="paidLeaveHours"
              name="paid leave"
              fill={colors.paidLeave}
            />
            <Bar
              stackId="days"
              dataKey="paidParentalLeaveUsed"
              name="paid parental leave"
              fill={colors.paidParentalLeave}
            />
            <Bar
              stackId="days"
              dataKey="unpaidParentalLeaveUsed"
              name="unpaid parental leave"
              fill={colors.unpaidParentalLeave}
            />
            <Bar
              stackId="days"
              dataKey="sickDays"
              name="sick hours"
              fill={colors.sick}
            />
            <Bar
              stackId="days"
              dataKey="event"
              name="event hours"
              fill={colors.event}
            />
            <Bar
              stackId="days"
              dataKey="missing"
              name="missing hours"
              fill={colors.missing}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
