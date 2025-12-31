import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AggregationClient } from '../../clients/AggregationClient';

type ExternalOverviewChartProps = {
  year?: number;
};

export function ExternalOverviewChart({ year }: ExternalOverviewChartProps) {
  const [state, setState] = useState<any | null>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(
      (res) => setState(res),
    );
  }, [year]);

  if (!state) return <AlignedLoader />;

  const data = state?.map((it) => ({
    name: it.yearMonth,
    countContractExternal: it.countContractExternal,
    actualCostContractExternal: it.actualCostContractExternal,
    actualRevenueExternal: it.actualRevenueExternal,
  }));

  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" type="number" />
        <YAxis
          yAxisId="right"
          type="number"
          orientation="right"
          domain={['dataMin ', 'dataMax ']}
        />

        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? new Intl.NumberFormat('en').format(value)
              : value
          }
        />
        <Legend />

        <Line
          yAxisId="right"
          dataKey="countContractExternal"
          stroke="#9e9e9e"
          name="Count"
        />

        <Line
          yAxisId="left"
          dataKey="actualRevenueExternal"
          stroke="#1de8b5"
          name="Revenue"
        />
        <Line
          yAxisId="left"
          dataKey="actualCostContractExternal"
          stroke="#3f51b5"
          name="Cost"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
