import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { Box, CardContent } from "@mui/material";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import BackIcon from "@mui/icons-material/ChevronLeft";
import NextIcon from "@mui/icons-material/ChevronRight";
import Grid2 from "@mui/material/Grid2";
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
import CardHeader from "@mui/material/CardHeader";
import { AggregationClient } from "../../clients/AggregationClient";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import Button from "@mui/material/Button";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";

/**
 * @return {null}
 */
export function MonthFeature() {
  const [date, setDate] = useState(dayjs().startOf("month"));
  const [totalPerPersonState, setTotalPerPersonState] = useState<any>();
  const [clientHourOverviewState, setClientHourOverviewState] = useState<any>();

  const history = useHistory();

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
    setDate(date.add(amount, "month"));
  };

  if (!totalPerPersonState || !clientHourOverviewState)
    return <AlignedLoader />;

  const totalPerPersonData = totalPerPersonState
    .filter((it) => it.assignment > 0)
    .map((it) => ({
      ...it,
      missing: Math.max(
        it.total -
          (it.workDays +
            it.leaveDayUsed +
            it.sickDays +
            it.event +
            it.paidParentalLeaveUsed +
            it.unpaidParentalLeaveUsed),
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
            // @ts-ignore
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
            dataKey="leaveDayUsed"
            name="leave hours"
            fill="#42a5f5"
          />
          <Bar
            stackId="days"
            dataKey="paidParentalLeaveUsed"
            name="paid parental leave"
            fill="#FFB6C1"
          />
          <Bar
            stackId="days"
            dataKey="unpaidParentalLeaveUsed"
            name="unpaid parental leave"
            fill="#87CEFA"
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

  return (
    <Box
      className={"flow"}
      flow-gap={"wide"}
      style={{ paddingBottom: "1.5rem" }}
    >
      <Card>
        <CardContent>
          <Grid2 container spacing={1}>
            <Grid2 size="grow">
              <Typography variant="h6">
                Month: {date.format("YYYY-MM")}
              </Typography>
              <Typography>
                Total persons: {totalPerPersonData.length}
              </Typography>
              <Typography>Total hours: {totalHours}</Typography>
            </Grid2>
            <Grid2>
              <IconButton onClick={handleMonth(-1)} size="large">
                <BackIcon />
              </IconButton>
              <IconButton onClick={handleMonth(1)} size="large">
                <NextIcon />
              </IconButton>
            </Grid2>
          </Grid2>
        </CardContent>
      </Card>
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
      <Card>
        <CardHeader title="Hours per client per person" />
        <CardContent>
          <Typography>
            This report has been improved and can now be found under the
            "Reports" menu item.
          </Typography>
          <Box mt={2}>
            <Button onClick={() => history.push("/reports/assignment")}>
              Open report
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
