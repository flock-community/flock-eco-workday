import React from "react"
import Typography from "@material-ui/core/Typography"
import {makeStyles} from "@material-ui/core/styles"
import {useUserMe} from "../../hooks/UserMeHook"

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
})

export function HomeFeature() {
  const classes = useStyles()
  const user = useUserMe()

  return (
    <div className={classes.root}>
      <Typography variant="h2">Welcome in workday</Typography>
      <Typography>You are logged in as {user && user.name}</Typography>
    </div>
  )
}
