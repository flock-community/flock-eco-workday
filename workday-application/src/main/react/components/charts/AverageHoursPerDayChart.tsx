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
import { AggregationClient } from '../../clients/AggregationClient';
import { useChartColors } from '../../theme/chartColors';

type AverageHoursPerDayChartProps = {
  year?: number;
};

export function AverageHoursPerDayChart({
  year,
}: AverageHoursPerDayChartProps) {
  const colors = useChartColors();
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(
      (res) => setState(res),
    );
  }, [year]);

  if (!state) return <AlignedLoader />;

  return (
    <ResponsiveContainer>
      <BarChart data={state}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="yearMonth" />
        <YAxis />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? new Intl.NumberFormat('en').format(value)
              : value
          }
        />
        <Legend />
        <Bar
          stackId="forcast"
          dataKey="forecastHoursGross"
          fill={colors.forecast}
        />
        <Bar stackId="actual" dataKey="actualHours" fill={colors.worked} />
      </BarChart>
    </ResponsiveContainer>
  );
}
