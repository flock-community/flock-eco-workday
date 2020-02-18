import React from "react"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import {CardContent} from "@material-ui/core"
import {RevenuePerMonthChart} from "../../components/charts/RevenuePerMonthChart"
import {CostPerMonthChart} from "../../components/charts/CostPerMonthChart"
import {RevenueCostPerMonthChart} from "../../components/charts/RevenueCostPerMonthChart"

export function DashboardFeature() {
  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div style={{height: 200}}>
              <RevenuePerMonthChart />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div style={{height: 200}}>
              <CostPerMonthChart />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <div style={{height: 200}}>
              <RevenueCostPerMonthChart />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
