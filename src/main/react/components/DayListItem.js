import React from "react"
import PropTypes from "prop-types"
import {Card, CardContent, makeStyles, Typography} from "@material-ui/core"

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
  },
  status: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

export function DayListItem({value, onClick}) {
  const classes = useStyles()

  return (
    <Card onClick={onClick}>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {value.description ? value.description : "empty"}
        </Typography>
        <Typography>
          Period: {value.from.format("DD-MM-YYYY")} - {value.to.format("DD-MM-YYYY")}
        </Typography>
        <Typography>Aantal dagen: {value.to.diff(value.from, "days") + 1}</Typography>
        <Typography>Aantal uren: {value.hours}</Typography>
        <Typography className={classes.status}>{value.status}</Typography>
      </CardContent>
    </Card>
  )
}

DayListItem.propTypes = {
  value: PropTypes.object,
  onClick: PropTypes.func,
}
