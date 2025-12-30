import Typography from "@mui/material/Typography";
import React, { Fragment, useEffect, useState } from "react";
import { AggregationClient } from "../../../clients/AggregationClient";
import { Box, TableBody, TableContainer } from "@mui/material";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import makeStyles from "@mui/styles/makeStyles";
import AssignmentReportTableRow from "./AssignmentReportTableRow";
import { Dayjs } from "dayjs";
import { AggregationClientPersonAssignmentOverview } from "../../../wirespec/Models";

const useStyles = makeStyles({
  tableContainer: {
    width: "auto",
  },
});

type AssignmentReportTableProps = {
  from: Dayjs;
  to: Dayjs;
};

export default function AssignmentReportTable({
  from,
  to,
}: AssignmentReportTableProps) {
  const [clientHourOverviewState, setClientHourOverviewState] =
    useState<AggregationClientPersonAssignmentOverview[]>();
  const [dayRange, setDayRange] = useState<string[]>();

  const classes = useStyles();

  useEffect(() => {
    const daysInMonth = to.diff(from, "days", false) + 1;
    setDayRange(
      Array.from(Array(daysInMonth).keys()).map((n) => {
        return from.add(n, "day").format("dd DD");
      })
    );
  }, [from, to]);

  useEffect(() => {
    let cancel = false;
    AggregationClient.clientAssignmentPersonBetween(from, to).then(
      (res) => !cancel && setClientHourOverviewState(res)
    );
    return () => {
      cancel = true;
    };
  }, [from, to]);

  if (!clientHourOverviewState) {
    return <AlignedLoader />;
  }

  return (
    <TableContainer className={classes.tableContainer}>
      <Table size="small">
        <TableBody>
          {clientHourOverviewState.map((it, clientIndex) => (
            <Fragment key={clientIndex}>
              <TableRow>
                <TableCell colSpan={(dayRange?.length ?? 0) + 2}>
                  <Box mt={5}>
                    <Typography variant="h6">{it.client.name}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                {/*Icon and person name cells*/}
                <TableCell colSpan={2} />
                {dayRange?.map((day, dayIndex) => (
                  <TableCell key={dayIndex}>
                    <b>{day}</b>
                  </TableCell>
                ))}
              </TableRow>
              {it.aggregationPersonAssignment.map((person, personIndex) => (
                <AssignmentReportTableRow
                  key={personIndex}
                  item={person}
                  from={from}
                  to={to}
                />
              ))}
              <TableRow>
                <TableCell />
                <TableCell>Totals</TableCell>
                {it.totals.map((val, dayTotalIndex) => (
                  <TableCell key={dayTotalIndex}>
                    <b>{val.toFixed(1)}</b>
                  </TableCell>
                ))}
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
