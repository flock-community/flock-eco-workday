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

export function InternalCostChart({ year }) {
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
        countContractInternal: it.countContractInternal,
        actualCostContractInternal: it.actualCostContractInternal,
      }));

  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" type="number"  />
        <YAxis yAxisId="right" type="number" orientation='right' />

        <Tooltip
          formatter={value => new Intl.NumberFormat("en").format(value)}
        />
        <Legend />

        <Line
          yAxisId="right"
          dataKey="countContractInternal"
        />
        <Line
          yAxisId="left"
          dataKey="actualCostContractInternal"
        />

      </LineChart>
    </ResponsiveContainer>
  );
}
