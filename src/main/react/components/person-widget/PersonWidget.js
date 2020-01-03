import React from "react"
import PropTypes from "prop-types"
import clsx from "clsx"
import {
  Card,
  CardHeader,
  Avatar,
  CardActions,
  Typography,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {blue} from "@material-ui/core/colors"
import FavoriteIcon from "@material-ui/icons/Favorite"
import InboxIcon from "@material-ui/icons/Inbox"
import DraftsIcon from "@material-ui/icons/Drafts"
import FaceIcon from "@material-ui/icons/Face"

const useStyles = makeStyles(() => ({
  card: {
    maxWidth: 328,
  },
  chipWrapper: {
    display: "flex",
    flexDirection: "row-reverse",
    padding: "1em 1em 0.625em",
  },
  avatar: {
    backgroundColor: blue[500],
  },
  dflex: {display: "flex"},
  flexColumn: {flexDirection: "column"},
  p1: {padding: "1rem"},
  m1: {margin: "1rem"},
  mb1: {marginBottom: "1rem"},
}))

export function PersonWidget(props) {
  const {person} = props
  const classes = useStyles()

  return (
    <Card className={clsx(classes.card, classes.mb1)}>
      <div className={classes.chipWrapper}>
        <Chip
          icon={<FaceIcon />}
          color="primary"
          label="Full-Stack Developer"
          variant="outlined"
          size="small"
        />
      </div>
      <CardHeader
        avatar={
          <Avatar className={classes.avatar} aria-label="recipe">
            WF
          </Avatar>
        }
        title={`${person.firstname} ${person.lastname}`}
        subheader={person.email}
      />
      <Divider />
      <div className={clsx(classes.dflex, classes.flexColumn, classes.p1)}>
        <div className={classes.mb1}>
          <Typography variant="caption">Organization</Typography>
          <Typography variant="body2">Flock.community</Typography>
        </div>
        <div className={clsx(classes.dflex, classes.flexColumn, classes.mb1)}>
          <Typography variant="caption">Status</Typography>
          <Chip
            color="default"
            disabled
            label="disabled"
            variant="default"
            size="small"
          />
        </div>
      </div>
      <Divider />
      <div>
        <List component="nav" aria-label="main mailbox folders" dense>
          <ListItem button>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary="Inbox" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <DraftsIcon />
            </ListItemIcon>
            <ListItemText primary="Drafts" />
          </ListItem>
        </List>
      </div>
      <CardActions>
        <IconButton aria-label="add me">
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  )
}

PersonWidget.propTypes = {
  person: PropTypes.object.isRequired,
}
