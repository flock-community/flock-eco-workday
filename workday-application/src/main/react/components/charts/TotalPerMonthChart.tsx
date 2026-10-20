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

type TotalPerMonthChartProps = {
  year?: number;
};

export function TotalPerMonthChart({ year }: TotalPerMonthChartProps) {
  const colors = useChartColors();
  const [state, setState] = useState<any>();

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(
      (res) => setState(res),
    );
  }, [year]);

  if (!state) return <AlignedLoader />;

  const data = state
    ?.map((it) => ({
      name: it.yearMonth,
      actualRevenue: it.actualRevenue,
      actualCostContractService: it.actualCostContractService,
      actualCostContractManagement: it.actualCostContractManagement,
      actualCostContractExternal: it.actualCostContractExternal,
      actualCostContractInternal: it.actualCostContractInternal,
    }))
    .map((it) => ({
      ...it,
      actualCost: [
        it.actualCostContractService,
        it.actualCostContractManagement,
        it.actualCostContractExternal,
        it.actualCostContractInternal,
      ].reduce((acc, cur) => acc + cur),
    }))
    .map((it) => ({
      ...it,
      margin: it.actualRevenue - it.actualCost,
    }))
    .map((it) => ({
      ...it,
      grossMargin: it.margin > 0 ? it.margin : 0,
      negativeGrossMargin: it.margin < 0 ? Math.abs(it.margin) : 0,
    }));

  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? new Intl.NumberFormat('en').format(value)
              : value
          }
        />
        <Legend />

        <Bar stackId="revenue" dataKey="actualRevenue" fill={colors.revenue} />
        <Bar
          stackId="revenue"
          dataKey="negativeGrossMargin"
          fill={colors.loss}
        />

        <Bar
          stackId="cost"
          dataKey="actualCostContractExternal"
          fill={colors.cost}
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternal"
          fill={colors.cost}
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractManagement"
          fill={colors.cost}
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractService"
          fill={colors.cost}
        />
        <Bar stackId="cost" dataKey="grossMargin" fill={colors.profit} />
      </BarChart>
    </ResponsiveContainer>
  );
}
