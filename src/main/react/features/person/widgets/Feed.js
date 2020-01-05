import React from "react"
import PropTypes from "prop-types"
import {Card, CardContent, Typography, CardActions, IconButton} from "@material-ui/core"
import CreateIcon from "@material-ui/icons/Create"
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded"
import {makeStyles} from "@material-ui/styles"

const useStyles = makeStyles(() => ({
  root: {},
  header: {
    display: "flex",
    flexDirection: "row",
    padding: "1rem",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {fontSize: ".75rem"},
  btnOval: {
    "borderRadius": "50%",
    "fontSize": "1.5rem",
    "textAlign": "center",
    "padding": 12,
    "minWidth": 24, // override MuiButtonBase-root attribute
    "height": 24,
    "&:hover": {backgroundColor: "grey"},
  },
}))

export const Feed = props => {
  const {title, onEdit, onDelete} = props
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <header className={classes.header}>
        <Typography
          className={classes.title}
          variant="h1"
          color="textSecondary"
          gutterBottom
        >
          {title}
        </Typography>
        <CardActions>
          <IconButton size="small" aria-label="edit" onClick={onEdit}>
            <CreateIcon />
          </IconButton>
          <IconButton
            color="secondary"
            size="small"
            aria-label="delete"
            onClick={onDelete}
          >
            <DeleteRoundedIcon />
          </IconButton>
        </CardActions>
      </header>
      <CardContent>{props.children}</CardContent>
    </Card>
  )
}

Feed.propTypes = {
  title: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  children: PropTypes.any,
}
