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

export function DashboardHoursChart() {
  const [state, setState] = useState<any>();

  useEffect(() => {
    AggregationClient.totalPerPersonMe().then((res) => setState(res));
  }, []);

  if (!state) return <AlignedLoader />;

  const data = Object.keys(state)
    .map((monthYear) => ({ ...state[monthYear], monthYear }))
    .filter((it) => it !== null)
    .filter((it) => it.assignment > 0)
    .map((it) => ({
      ...it,
      missing: Math.max(
        it.total - (it.workDays + it.holiDayUsed + it.sickDays + it.event + it.paidParentalLeaveUsed
        + it.unpaidParentalLeaveUsed),
        0
      ),
    }));

  const height = 50 + data.length * 50;

  return (
    <ResponsiveContainer height={height}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="monthYear" />
        <Tooltip formatter={(value) => new Intl.NumberFormat().format(value)} />
        <Legend />
        <Bar
          stackId="days"
          dataKey="workDays"
          name="worked hours"
          fill="#1de8b5"
        />
        <Bar
          stackId="days"
          dataKey="holiDayUsed"
          name="holiday hours"
          fill="#42a5f5"
        />
        <Bar
          stackId="days"
          dataKey="paidParentalLeaveUsed"
          name="paid parental leave"
          fill="#42a5f5"
        />
        <Bar
          stackId="days"
          dataKey="unpaidParentalLeaveUsed"
          name="unpaid parental leave"
          fill="#42a5f5"
        />
        <Bar
          stackId="days"
          dataKey="sickDays"
          name="sick hours"
          fill="#ef5350"
        />
        <Bar stackId="days" dataKey="event" name="event hours" fill="#fed766" />
        <Bar
          stackId="days"
          dataKey="missing"
          name="missing hours"
          fill="#9e9e9e"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
