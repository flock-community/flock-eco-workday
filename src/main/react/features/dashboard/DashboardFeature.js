import React from "react"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import {CardContent, makeStyles} from "@material-ui/core"
import CardHeader from "@material-ui/core/CardHeader"
import {HolidaysPerPersonChart} from "../../components/charts/HolidaysPerPersonChart"
import {SickdayPerPersonChart} from "../../components/charts/SickdayPerPersonChart"
import {RevenuePerClientChart} from "../../components/charts/RevenuePerClientChart"
import {TotalPerMonthChart} from "../../components/charts/TotalPerMonthChart"

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
})

const CHART_HEIGHT = 200

export function DashboardFeature() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12} md={12}>
          <Card>
            <CardHeader title="Actual" />
            <CardContent>
              <div style={{height: CHART_HEIGHT * 2}}>
                <TotalPerMonthChart />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Revenue per client" />
            <CardContent>
              <div style={{height: CHART_HEIGHT}}>
                <RevenuePerClientChart />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Holiday" />
            <CardContent>
              <HolidaysPerPersonChart />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Sickday" />
            <CardContent>
              <SickdayPerPersonChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
