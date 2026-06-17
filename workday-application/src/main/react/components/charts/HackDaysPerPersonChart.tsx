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
  type AggregationHackDay,
} from '../../clients/AggregationClient';
import { useChartColors } from '../../theme/chartColors';

type HackDaysPerPersonChartProps = {
  readonly year: number;
};

export function HackDaysPerPersonChart({ year }: HackDaysPerPersonChartProps) {
  const colors = useChartColors();
  const [state, setState] = useState<AggregationHackDay[] | null>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.hackDayReportByYear(year || date.getFullYear()).then(
      (res) =>
        setState(
          res
            .filter((it) => it.contractHours > 0)
            .map((it) => ({
              ...it,
              availableHours: Math.max(it.contractHours - it.hackHoursUsed, 0),
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
          stackId="used"
          dataKey="hackHoursUsed"
          name="used"
          fill={colors.leave}
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
