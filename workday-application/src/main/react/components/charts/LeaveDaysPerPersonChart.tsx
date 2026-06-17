import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
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
import {
  AggregationClient,
  type AggregationLeaveDay,
} from '../../clients/AggregationClient';
import { useChartColors } from '../../theme/chartColors';

type LeaveDaysPerPersonChartProps = {
  year?: number;
};

export function LeaveDaysPerPersonChart({
  year,
}: LeaveDaysPerPersonChartProps) {
  const colors = useChartColors();
  const [state, setState] = useState<AggregationLeaveDay[] | null>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.leaveDayReportByYear(year || date.getFullYear()).then(
      (res) =>
        setState(
          res
            .filter(
              (it) =>
                it.contractHours > 0 ||
                it.holidayHours > 0 ||
                it.plusHours > 0 ||
                it.paidLeaveHours > 0,
            )
            .map((it) => ({
              ...it,
              availableHours: Math.max(
                it.contractHours + it.plusHours - it.holidayHours,
                0,
              ),
            })),
        ),
    );
  }, [year]);

  if (!state) return <AlignedLoader />;

  const height = 50 + state.length * 50;

  return (
    <ResponsiveContainer height={height}>
      <BarChart data={state} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? new Intl.NumberFormat('en').format(value)
              : value
          }
        />
        <Legend />
        <Bar
          stackId="available"
          dataKey="contractHours"
          name="contract"
          fill={colors.contract}
        />
        <Bar
          stackId="available"
          dataKey="plusHours"
          name="plus"
          fill={colors.plus}
        />
        <Bar
          stackId="used"
          dataKey="holidayHours"
          name="used"
          fill={colors.leave}
        />
        <Bar
          stackId="padiPL"
          dataKey="paidParentalLeaveHours"
          name="paid parental leave"
          fill={colors.paidParentalLeave}
        />
        <Bar
          stackId="unPaidPL"
          dataKey="unpaidParentalLeaveHours"
          name="unpaid parental leave"
          fill={colors.unpaidParentalLeave}
        />
        <Bar
          stackId="paidLeave"
          dataKey="paidLeaveHours"
          name="paid leave"
          fill={colors.paidLeave}
        />
        <Bar
          stackId="used"
          dataKey="availableHours"
          name="available"
          fill={colors.available}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
