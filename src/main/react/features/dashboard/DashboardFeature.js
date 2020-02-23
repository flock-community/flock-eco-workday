import React, {useEffect, useState} from "react"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import {CardContent, makeStyles} from "@material-ui/core"
import CardHeader from "@material-ui/core/CardHeader"
import {RevenuePerMonthChart} from "../../components/charts/RevenuePerMonthChart"
import {CostPerMonthChart} from "../../components/charts/CostPerMonthChart"
import {RevenueCostPerMonthChart} from "../../components/charts/RevenueCostPerMonthChart"
import {HolidaysPerPersonChart} from "../../components/charts/HolidaysPerPersonChart"
import {SickdayPerPersonChart} from "../../components/charts/SickdayPerPersonChart"
import {PersonService} from "../person/PersonService"

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

  const [persons, setPersons] = useState()

  useEffect(() => {
    PersonService.findAllByPage({page: 0, size: 100, sort: "lastname"}).then(res =>
      setPersons(
        res.list.reduce((acc, cur) => {
          acc[cur.code] = `${cur.firstname} ${cur.lastname}`
          return acc
        }, {})
      )
    )
  }, [])

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Card>
            <CardHeader title="Revenue" />
            <CardContent>
              <div style={{height: CHART_HEIGHT}}>
                <RevenuePerMonthChart />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardHeader title="Cost" />
            <CardContent>
              <div style={{height: CHART_HEIGHT}}>
                <CostPerMonthChart />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Revenue Cost" />
            <CardContent>
              <div style={{height: CHART_HEIGHT}}>
                <RevenueCostPerMonthChart />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Holiday" />
            <CardContent>
              <div style={{height: CHART_HEIGHT}}>
                <HolidaysPerPersonChart persons={persons} />
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Sickday" />
            <CardContent>
              <div style={{height: CHART_HEIGHT}}>
                <SickdayPerPersonChart persons={persons} />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
