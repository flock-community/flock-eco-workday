import React from "react"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/styles"
import {PersonTable} from "./table/PersonTable"
import {Paper} from "@material-ui/core"
import { PersonSubNav } from "./PersonSubNav"

const persons = [
  {
    firstname: "Workday",
    lastname: "Flock",
    email: "workday@flock-se.com",
    active: "today",
    holidays: 14,
    clients: 1,
    hours: 24,
  },
  {
    firstname: "Workday",
    lastname: "Flock",
    email: "workday@flock-se.com",
    active: "yesterday",
    holidays: 24,
    clients: 1,
    hours: 14,
  },
  {
    firstname: "Workday",
    lastname: "Flock",
    email: "workday@flock-se.com",
    active: "day before yesterday",
    holidays: 14,
    clients: 1,
    hours: 4,
  },
]

const useStyles = makeStyles(() => ({
  root: {
    // override .MuiGrid-spacing-xs-1 class properties
    margin: 0,
    width: "auto",
  },
  paper: {
    margin: 16,
    maxWidth: 1200, // should represent a @screen break-point
    width: "100%",
  },
}))

export const PersonFeature = () => {
  const classes = useStyles()

  return (
    <Grid container className={classes.root} spacing={1}>
      <PersonSubNav />
      <Paper className={classes.paper}>
        <PersonTable persons={persons}></PersonTable>
      </Paper>
    </Grid>
  )
}
