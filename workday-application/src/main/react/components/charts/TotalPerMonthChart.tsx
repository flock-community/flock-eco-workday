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

type TotalPerMonthChartProps = {
  year?: number;
};

export function TotalPerMonthChart({ year }: TotalPerMonthChartProps) {
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
      actualCostContractInternalTax: it.actualCostContractInternal * 0.22,
      actualCostContractInternalHoliday: it.actualCostContractInternal / 12,
      actualCostContractInternalRetirement: it.actualCostContractInternal * 0.1,
      actualCostContractInternalTraining:
        (it.countContractInternal * 5000) / 12,
      actualCostContractInternalTravel: it.countContractInternal * 300,
      actualCostContractInternalInsurance: it.countContractInternal * 100,
    }))
    .map((it) => ({
      ...it,
      actualCost: [
        it.actualCostContractService,
        it.actualCostContractManagement,
        it.actualCostContractExternal,
        it.actualCostContractInternal,
        it.actualCostContractInternalTax,
        it.actualCostContractInternalHoliday,
        it.actualCostContractInternalRetirement,
        it.actualCostContractInternalTraining,
        it.actualCostContractInternalTravel,
        it.actualCostContractInternalInsurance,
      ].reduce((acc, cur) => acc + cur),
    }))
    .map((it) => ({
      ...it,
      margin: it.actualRevenue - it.actualCost,
    }))
    .map((it) => ({
      ...it,
      profit: it.margin > 0 ? it.margin : 0,
      loss: it.margin < 0 ? Math.abs(it.margin) : 0,
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

        <Bar stackId="revenue" dataKey="actualRevenue" fill="#1de8b5" />
        <Bar stackId="revenue" dataKey="loss" fill="red" />

        <Bar
          stackId="cost"
          dataKey="actualCostContractExternal"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternal"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalTax"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalHoliday"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalRetirement"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalTraining"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalTravel"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractInternalInsurance"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractManagement"
          fill="#3f51b5"
        />
        <Bar
          stackId="cost"
          dataKey="actualCostContractService"
          fill="#3f51b5"
        />
        <Bar stackId="cost" dataKey="profit" fill="lightgreen" />
      </BarChart>
    </ResponsiveContainer>
  );
}
