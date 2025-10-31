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
import PropTypes from "prop-types";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";

type AverageHoursPerDayChartProps = {
  year?: number;
};

export function AverageHoursPerDayChart({
  year,
}: AverageHoursPerDayChartProps) {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerMonthByYear(year || date.getFullYear()).then(
      (res) => setState(res)
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
            typeof value === "number"
              ? new Intl.NumberFormat("en").format(value)
              : value
          }
        />
        <Legend />
        <Bar stackId="forcast" dataKey="forecastHoursGross" fill="#1de8b5" />
        <Bar stackId="actual" dataKey="actualHours" fill="#3f51b5" />
      </BarChart>
    </ResponsiveContainer>
  );
}

AverageHoursPerDayChart.propTypes = {
  year: PropTypes.number,
};
