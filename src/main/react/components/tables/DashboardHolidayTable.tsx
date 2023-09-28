import React, { useEffect, useState } from "react";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import {
  AggregationClient,
  AggregationLeaveDay,
} from "../../clients/AggregationClient";
import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { hoursFormatter } from "../../utils/Hours";

const useStyles = makeStyles({
  totalRows: {
    "& *": {
      fontWeight: 900,
    },
  },
  negative: {
    color: "red",
  },
});

export type HolidayReport = AggregationLeaveDay & {
  total: number;
  available: number;
};

export function DashboardHolidayTable() {
  const [state, setState] = useState<HolidayReport>();

  const classes = useStyles();

  useEffect(() => {
    const thisYear = new Date().getFullYear();

    AggregationClient.holidayReportMe(thisYear).then((res) => {
      const total = res.contractHours + res.plusHours;
      const available = total - res.holidayHours;

      const report: HolidayReport = {
        ...res,
        total,
        available,
      };

      setState(report);
    });
  }, []);

  if (!state) return <AlignedLoader />;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Hours</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Contract</TableCell>
          <TableCell>{hoursFormatter.format(state.contractHours)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Plus</TableCell>
          <TableCell>{hoursFormatter.format(state.plusHours)}</TableCell>
        </TableRow>
        <TableRow className={classes.totalRows}>
          <TableCell>Total</TableCell>
          <TableCell>{hoursFormatter.format(state.total)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Used</TableCell>
          <TableCell>{hoursFormatter.format(state.holidayHours)}</TableCell>
        </TableRow>
        <TableRow className={classes.totalRows}>
          <TableCell>Available</TableCell>
          <TableCell>
            <span className={state.available < 0 ? classes.negative : ""}>
              {hoursFormatter.format(state.available)}
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
