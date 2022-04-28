import React, { useEffect, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { Box, CardContent } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import BackIcon from "@material-ui/icons/ChevronLeft";
import NextIcon from "@material-ui/icons/ChevronRight";
import Grid from "@material-ui/core/Grid";
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
import Button from "@material-ui/core/Button";
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
      </Grid>
    </Grid>
  );
}
