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
import {
  AggregationClient,
  holidayReportByYear,
} from "../../clients/AggregationClient";

type HolidaysPerPersonChartProps = {
  year?: number;
};

export function HolidaysPerPersonChart({ year }: HolidaysPerPersonChartProps) {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.holidayReportByYear(year || date.getFullYear()).then(
      (res) =>
        setState(
          res
            .filter(
              (it) =>
                it.contractHours > 0 || it.holidayHours > 0 || it.plusHours > 0
            )
            .map((it) => ({
              ...it,
              availableHours: Math.max(
                it.contractHours + it.plusHours - it.holidayHours,
                0
              ),
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
        <Bar
          stackId="available"
          dataKey="contractHours"
          name="contract"
          fill="#9e9e9e"
        />
        <Bar
          stackId="available"
          dataKey="plusHours"
          name="plus"
          fill="#6c6c6c"
        />
        <Bar stackId="used" dataKey="holidayHours" name="used" fill="#42a5f5" />
        <Bar
          stackId="used"
          dataKey="availableHours"
          name="available"
          fill="#d2d2d2"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
