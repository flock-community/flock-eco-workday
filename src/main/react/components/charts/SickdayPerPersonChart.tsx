import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import PropTypes from "prop-types";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";

type SickdayPerPersonChartProps = {
  year?: number,
};
export function SickdayPerPersonChart({ year }:SickdayPerPersonChartProps) {

  const [state, setState] = useState<any>();

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerPersonByYear(
      year || date.getFullYear()
    ).then((res) => setState(res.filter((it) => it.sickDays > 0)));
  }, [year]);

  if (!state) return <AlignedLoader />;

  const height = 50 + state.length * 50;

  return (
    <ResponsiveContainer height={height}>
      <BarChart data={state} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="sickDays" />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip
          formatter={(value) => new Intl.NumberFormat("en").format(value)}
        />
        <Legend />
        <Bar dataKey="sickDays" fill="#3f51b5" />
      </BarChart>
    </ResponsiveContainer>
  );
}

SickdayPerPersonChart.propTypes = {
  year: PropTypes.number,
  persons: PropTypes.object,
};
