import React, { useEffect, useState } from "react";
import {LineChart, XAxis,
  YAxis,
  Legend,
  Tooltip,
  Line,
  ResponsiveContainer,
  CartesianGrid} from "recharts";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";

export function ExternalOverviewChart({ year }) {
  const [state, setState] = useState<any | null>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(
      res => setState(res)
    );
  }, []);

  if (!state) return <AlignedLoader />;

  const data =
    state &&
    state
      .map(it => ({
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
        <YAxis yAxisId="left" type="number"  />
        <YAxis yAxisId="right" type="number" orientation='right' domain={['dataMin ', 'dataMax ']} />

        <Tooltip
          formatter={value => new Intl.NumberFormat("en").format(value)}
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
