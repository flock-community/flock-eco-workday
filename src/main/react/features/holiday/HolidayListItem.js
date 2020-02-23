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

export function HolidayListItem({value, onClick}) {
  const classes = useStyles()

  return (
    <Card onClick={onClick}>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {value.description ? value.description : "empty"}
        </Typography>
        <Typography>
          Period: {value.period.from.format("DD-MM-YYYY")} -{" "}
          {value.period.to.format("DD-MM-YYYY")}
        </Typography>
        <Typography>
          Aantal dagen: {value.period.days.filter(day => day.hours > 0).length}
        </Typography>
        <Typography>
          Aantal uren: {value.period.days.reduce((acc, cur) => cur.hours + acc, 0)}
        </Typography>
        <Typography className={classes.status}>{value.status}</Typography>
      </CardContent>
    </Card>
  )
}

HolidayListItem.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
}
