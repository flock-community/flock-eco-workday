import React, {useState} from "react"
import PropTypes from "prop-types"
import {Card, CardContent, Typography, CardActions, IconButton} from "@material-ui/core"
import CreateIcon from "@material-ui/icons/Create"
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded"
import {makeStyles} from "@material-ui/styles"
import {PersonDialog} from "../PersonDialog"
import {PersonService} from "../PersonService"
import {ConfirmDialog} from "@flock-eco/core/src/main/react/components/ConfirmDialog"

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
  const {title, item} = props
  const [dialog, setDialog] = useState({open: false, item: null})
  const [dialogDelete, setDialogDelete] = useState(false)
  const classes = useStyles()

  const handleDialogOpen = () => {
    setDialog({open: true, item})
  }
  const handleDialogClose = () => {
    setDialog({open: false, item: null})
  }

  const handleDeleteDialog = () => {
    setDialogDelete(!dialogDelete)
  }

  const handleDelete = () => {
    PersonService.delete(item.id)
      .then(() => handleDeleteDialog())
      .catch(err => console.log(err))
  }

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
          <IconButton size="small" aria-label="edit" onClick={handleDialogOpen}>
            <CreateIcon />
          </IconButton>
          <IconButton
            color="secondary"
            size="small"
            aria-label="delete"
            onClick={handleDeleteDialog}
          >
            <DeleteRoundedIcon />
          </IconButton>
        </CardActions>
      </header>
      <CardContent>{props.children}</CardContent>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} item={dialog.item} />
      <ConfirmDialog
        open={dialogDelete}
        onConfirm={handleDelete}
        onClose={handleDeleteDialog}
      >
        Surely you can't be serious? Delete {item.firstname} {item.lastname}
      </ConfirmDialog>
    </Card>
  )
}

Feed.propTypes = {
  title: PropTypes.string.isRequired,
  item: PropTypes.any,
}
