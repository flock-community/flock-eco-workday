import React from "react"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/styles"
import {PersonTable} from "./table/PersonTable"
import {Paper} from "@material-ui/core"
import { PersonSubNav } from "./PersonSubNav"


const useStyles = makeStyles(() => ({
  root: {
    // override .MuiGrid-spacing-xs-1 class properties
    margin: 0,
    width: "auto",
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
