import React, {useState} from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import {CardContent, MenuItem, Select} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import CardHeader from "@material-ui/core/CardHeader";
import {HolidaysPerPersonChart} from "../../components/charts/HolidaysPerPersonChart";
import {SickdayPerPersonChart} from "../../components/charts/SickdayPerPersonChart";
import {RevenuePerClientTable} from "../../components/charts/RevenuePerClientTable";
import {TotalPerMonthChart} from "../../components/charts/TotalPerMonthChart";
import {AverageHoursPerDayChart} from "../../components/charts/AverageHoursPerDayChart";
import {InternalOverviewChart} from "../../components/charts/InternalOverviewChart";
import {ExternalOverviewChart} from "../../components/charts/ExternalOverviewChart";
import {ManagementOverviewChart} from "../../components/charts/ManagementOverviewChart";
import moment from "moment";
import {GrossMarginTable} from "../../components/tables/GrossMarginTable";

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
});

const CHART_HEIGHT = 200;

export function DashboardFeature() {
  const classes = useStyles();

  const startYear = 2019;
  const now = moment();
  const [year, setYear] = useState<number>(now.year());

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Year" />
            <CardContent>
              <Select
                value={year.toString()}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              >
                {Array.from(Array(now.year() - startYear + 1).keys())
                  .map((i) => String(startYear + i))
                  .map((it) => (
                    <MenuItem key={it} value={it}>
                      {it}
                    </MenuItem>
                  ))}
              </Select>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Actual cost revenue" />
            <CardContent>
              <div style={{ height: CHART_HEIGHT * 2 }}>
                <TotalPerMonthChart year={year} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Average hours per day" />
            <CardContent>
              <div style={{ height: CHART_HEIGHT * 2 }}>
                <AverageHoursPerDayChart year={year} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Internal overview" />
            <CardContent>
              <div style={{ height: CHART_HEIGHT * 2 }}>
                <InternalOverviewChart year={year} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="External overview" />
            <CardContent>
              <div style={{ height: CHART_HEIGHT * 2 }}>
                <ExternalOverviewChart year={year} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Management overview" />
            <CardContent>
              <div style={{ height: CHART_HEIGHT * 2 }}>
                <ManagementOverviewChart year={year} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Gross revenue per client" />
            <CardContent>
              <RevenuePerClientTable year={year} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Holiday" />
            <CardContent>
              <HolidaysPerPersonChart year={year} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Sickday" />
            <CardContent>
              <SickdayPerPersonChart year={year} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Gross margin" />
            <CardContent>
              <GrossMarginTable year={year} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
