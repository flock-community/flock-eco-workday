import Typography from "@material-ui/core/Typography";
import React, { Fragment, useEffect, useState } from "react";
import { AggregationClient } from "../../clients/AggregationClient";
import moment from "moment";
import { TableBody, TableContainer } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  tableContainer: {
    width: "auto",
  },
});

type ReportINGProps = {
  from: moment.Moment;
  to: moment.Moment;
};

export default function AssignmentReportTable({ from, to }: ReportINGProps) {
  const [clientHourOverviewState, setClientHourOverviewState] = useState<any>();
  const [dayRange, setDayRange] = useState<string[]>();

  const classes = useStyles();

  useEffect(() => {
    const daysInMonth = to.diff(from, "days", false) + 1;
    setDayRange(
      Array.from(Array(daysInMonth).keys()).map((n) => {
        return from.clone().add(n, "day").format("dd DD");
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
                <TableCell colSpan={dayRange?.length}>
                  <Typography variant="h6">{it.client.name}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell />
                {dayRange?.map((day, dayIndex) => (
                  <TableCell key={dayIndex}>
                    <b>{day}</b>
                  </TableCell>
                ))}
              </TableRow>
              {it.aggregationPersonAssignment.map((person, personIndex) => (
                <TableRow key={personIndex}>
                  <TableCell>
                    {person.person.name} ({person.assignment.name})
                  </TableCell>
                  {person.hours.map((val, personHoursIndex) => (
                    <TableCell width={10} key={personHoursIndex}>
                      {val > 0 ? val.toFixed(1) : "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
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
