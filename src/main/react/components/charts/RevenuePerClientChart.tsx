import React, { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import PropTypes from "prop-types";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { AggregationClient } from "../../clients/AggregationClient";


type RevenuePerClientChartProps = {
  year?: number,
};

export function RevenuePerClientChart({ year }: RevenuePerClientChartProps) {
  const [state, setState] = useState<any>({});

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerClientByYear(
      year || date.getFullYear()
    ).then((res) => setState(res));
  }, []);

  if (!state) return <AlignedLoader />;

  return (
    <ResponsiveContainer>
      <PieChart height={500}>
        <Pie
          data={state}
          dataKey="revenueGross"
          nameKey="name"
          fill="#3f51b5"
          label
        />
        <Tooltip
          formatter={(value) => new Intl.NumberFormat("en").format(value)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

RevenuePerClientChart.propTypes = {
  year: PropTypes.number,
  clients: PropTypes.object,
};
