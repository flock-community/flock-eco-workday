import React, { Fragment, useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { CardContent, TableBody, TableContainer } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import moment from "moment";
import IconButton from "@material-ui/core/IconButton";
import BackIcon from "@material-ui/icons/ChevronLeft";
import NextIcon from "@material-ui/icons/ChevronRight";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CardHeader from "@material-ui/core/CardHeader";
import { AggregationClient } from "../../clients/AggregationClient";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";

/**
 * @return {null}
 */
export function MonthFeature() {
  const [date, setDate] = useState(moment().startOf("month"));

  const [dayRange, setDayRange] = useState<number[]>();
  const [totalPerPersonState, setTotalPerPersonState] = useState<any>();
  const [clientHourOverviewState, setClientHourOverviewState] = useState<any>();

  useEffect(() => {
    const daysInMonth = date.daysInMonth();
    setDayRange(Array.from(Array(daysInMonth).keys()).map((n) => n + 1));
  }, [date]);

  useEffect(() => {
    let cancel = false;
    AggregationClient.totalPerPersonByYearMonth(
      date.year(),
      date.month() + 1
    ).then((res) => !cancel && setTotalPerPersonState(res));
    return () => {
      cancel = true;
    };
  }, [date]);

  useEffect(() => {
    let cancel = false;
    AggregationClient.clientHourOverviewByYearMonth(
      date.year(),
      date.month() + 1
    ).then((res) => !cancel && setClientHourOverviewState(res));
    return () => {
      cancel = true;
    };
  }, [date]);

  const handleMonth = (amount) => () => {
    setDate(moment(date).add(amount, "month"));
  };

  if (!totalPerPersonState || !clientHourOverviewState)
    return <AlignedLoader />;

  const totalPerPersonData = totalPerPersonState
    .filter((it) => it.assignment > 0)
    .map((it) => ({
      ...it,
      missing: Math.max(
        it.total - (it.workDays + it.holiDayUsed + it.sickDays + it.event),
        0
      ),
    }));

  const totalHours = totalPerPersonData.reduce(
    (acc, cur) => acc + cur.workDays,
    0
  );

  const renderChart = (x) => {
    const height = 50 + x.length * 50;
    return (
      <ResponsiveContainer height={height}>
        <BarChart data={x} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat().format(value)}
          />
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
            dataKey="sickDays"
            name="sick hours"
            fill="#ef5350"
          />
          <Bar
            stackId="days"
            dataKey="event"
            name="event hours"
            fill="#fed766"
          />
          <Bar
            stackId="days"
            dataKey="missing"
            name="missing hours"
            fill="#9e9e9e"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderOverview = () => (
    <TableContainer>
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
              {it.aggregationPerson.map((person, personIndex) => (
                <TableRow key={personIndex}>
                  <TableCell>{person.person.name}</TableCell>
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

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={1}>
              <Grid item xs>
                <Typography variant="h6">
                  Month: {date.format("YYYY-MM")}
                </Typography>
                <Typography>
                  Total persons: {totalPerPersonData.length}
                </Typography>
                <Typography>Total hours: {totalHours}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={handleMonth(-1)}>
                  <BackIcon />
                </IconButton>
                <IconButton onClick={handleMonth(1)}>
                  <NextIcon />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Internal" />
          <CardContent>
            {renderChart(
              totalPerPersonData
                .filter((it) => it.contractTypes != null)
                .filter(
                  (it) =>
                    it.contractTypes.includes("ContractInternal") ||
                    it.contractTypes.includes("ContractManagement")
                )
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="External" />
          <CardContent>
            {renderChart(
              totalPerPersonData
                .filter((it) => it.contractTypes != null)
                .filter(
                  (it) =>
                    it.contractTypes.length === 0 ||
                    it.contractTypes.includes("ContractExternal")
                )
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardHeader title="Hours per client per person" />
          <CardContent>{renderOverview()}</CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
