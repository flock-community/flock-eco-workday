import React from "react"
import PropTypes from "prop-types"
import {
  makeStyles,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@material-ui/core"

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

export function HolidayListItem(props) {
  const {item, onEdit, onDelete} = props

  const classes = useStyles()

  const handleClickEdit = e => {
    e.preventDefault()
    onEdit(item.code)
  }

  const handleClickDelete = e => {
    e.preventDefault()
    onDelete(item.code)
  }

  return (
    <Card>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {item.description ? item.description : "empty"}
        </Typography>
        <Typography>
          Period: {item.period.from.format("DD-MM-YYYY")} -{" "}
          {item.period.to.format("DD-MM-YYYY")}
        </Typography>
        <Typography>
          Aantal dagen: {item.period.days.filter(day => day.hours > 0).length}
        </Typography>
        <Typography>
          Aantal uren: {item.period.days.reduce((acc, cur) => cur.hours + acc, 0)}
        </Typography>
        <Typography className={classes.status}>{item.status}</Typography>
      </CardContent>
      <CardActions>
        <Button color="primary" onClick={handleClickEdit}>
          Edit
        </Button>
        <Button color="secondary" onClick={handleClickDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

HolidayListItem.propTypes = {
  item: PropTypes.shape({
    code: PropTypes.string,
    description: PropTypes.string,
    period: PropTypes.object,
    status: PropTypes.string,
  }),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
}
