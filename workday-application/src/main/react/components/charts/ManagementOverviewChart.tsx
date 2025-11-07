import React, { useEffect, useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";

type ManagementOverviewChartProps = {
  year?: number;
};

export function ManagementOverviewChart({
  year,
}: ManagementOverviewChartProps) {
  const [state, setState] = useState<any | null>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(
      (res) => setState(res)
    );
  }, [year]);

  if (!state) return <AlignedLoader />;

  const data =
    state &&
    state.map((it) => ({
      name: it.yearMonth,
      countContractManagement: it.countContractManagement,
      actualCostContractManagement: it.actualCostContractManagement,
      actualRevenueManagement: it.actualRevenueManagement,
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
          domain={["dataMin ", "dataMax "]}
        />

        <Tooltip
          formatter={(value) =>
            typeof value === "number"
              ? new Intl.NumberFormat("en").format(value)
              : value
          }
        />
        <Legend />

        <Line
          yAxisId="right"
          dataKey="countContractManagement"
          stroke="#9e9e9e"
          name="Count"
        />

        <Line
          yAxisId="left"
          dataKey="actualRevenueManagement"
          stroke="#1de8b5"
          name="Revenue"
        />
        <Line
          yAxisId="left"
          dataKey="actualCostContractManagement"
          stroke="#3f51b5"
          name="Cost"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
