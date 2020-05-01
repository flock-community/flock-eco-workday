import React from "react"
import PropTypes from "prop-types"
import {Card, CardContent, makeStyles, Typography} from "@material-ui/core"
import {StatusMenu} from "./StatusMenu"

const useStyles = makeStyles(() => ({
  root: {
    position: "relative",
  },
}))

export function DayListItem({value, onClick, onClickStatus, hasAuthority}) {
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
        <StatusMenu
          onClickStatus={onClickStatus}
          hasAuthority={hasAuthority}
          value={value}
        />
      </CardContent>
    </Card>
  )
}

DayListItem.propTypes = {
  value: PropTypes.object,
  onClick: PropTypes.func,
  onClickStatus: PropTypes.func,
  hasAuthority: PropTypes.string,
}
