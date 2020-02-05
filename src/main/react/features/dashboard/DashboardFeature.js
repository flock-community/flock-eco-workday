import React from "react"
import Grid from "@material-ui/core/Grid"
import {RevenuePerMonthChart} from "../../components/charts/RevenuePerMonthChart"

export function DashboardFeature() {
  return (
    <Grid container>
      <Grid item xs={12} style={{height: 350}}>
        <RevenuePerMonthChart />
      </Grid>
    </Grid>
  )
}
