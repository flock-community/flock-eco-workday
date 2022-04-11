import React, { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";

const round = (i) => Math.round(i * 10) / 10;
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${value.toFixed(1)} uur`}
    </text>
  );
};
export function DashboardHolidayChart() {
  const [state, setState] = useState<any>();

  useEffect(() => {
    const date = new Date();
    AggregationClient.holidayReportMe(date.getFullYear()).then((res) =>
      setState(res)
    );
  }, []);

  if (!state) return <AlignedLoader />;

  const total = state.contractHours + state.plusHours;

  const data01 = [
    {
      name: "Available",
      value: round(Math.max(total - state.holidayHours, 0)),
    },
    { name: "Used", value: round(state.holidayHours) },
  ];

  const data02 = [
    { name: "Plus", value: round(state.plusHours) },
    { name: "Contract", value: round(state.contractHours) },
    { name: "Exceeded", value: round(Math.max(state.holidayHours - total, 0)) },
  ];

  return (
    <ResponsiveContainer height={400}>
      <PieChart>
        <Pie
          data={data01}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={160}
          label={renderCustomizedLabel}
        >
          <Cell fill={"#d2d2d2"} />
          <Cell fill={"#42a5f5"} />
        </Pie>
        <Pie
          data={data02}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={180}
          outerRadius={200}
          label
        >
          <Cell fill={"#6c6c6c"} />
          <Cell fill={"#9e9e9e"} />
          <Cell fill={"#ef5350"} />
        </Pie>
        <Tooltip formatter={(value) => value.toFixed(1)} />
      </PieChart>
    </ResponsiveContainer>
  );
}
