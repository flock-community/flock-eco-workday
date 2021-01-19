import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";

type HolidaysPerPersonChartProps = {
  year?: number;
};

export function HolidaysPerPersonChart({ year }: HolidaysPerPersonChartProps) {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerPersonByYear(year || date.getFullYear()).then(
      (res) =>
        setState(
          res
            .filter((it) => it.holiDayBalance > 0 || it.holiDayUsed > 0)
            .map((it) => ({
              ...it,
              holiDayAvailable:
                it.holiDayBalance > it.holiDayUsed
                  ? it.holiDayBalance - it.holiDayUsed
                  : 0,
              holiDayShortage:
                it.holiDayBalance && it.holiDayBalance < it.holiDayUsed
                  ? it.holiDayUsed - it.holiDayBalance
                  : 0,
            }))
        )
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
          formatter={(value) => new Intl.NumberFormat("en").format(value)}
        />
        <Legend />
        <Bar stackId="used" dataKey="holiDayUsed" name="used" fill="#3f51b5" />
        <Bar
          stackId="used"
          dataKey="holiDayAvailable"
          name="available"
          fill="#9e9e9e"
        />
        <Bar
          stackId="used"
          dataKey="holiDayShortage"
          name="shortage"
          fill="#ef5350"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
