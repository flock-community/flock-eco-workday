import React, {useEffect, useState} from "react"
import {Card, makeStyles, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import CardHeader from "@material-ui/core/CardHeader"
import Button from "@material-ui/core/Button"
import PropTypes from "prop-types"
import {TodoClient} from "../../clients/TodoClient"

const useStyles = makeStyles(theme => ({
  buttonDefault: {
    backgroundColor: "unset",
  },
  buttonRequested: {
    backgroundColor: "unset",
  },
  buttonApproved: {
    backgroundColor: theme.palette.success[500],
  },
  buttonRejected: {
    backgroundColor: theme.palette.error[500],
  },
}))

export function TodoList({onItemClick, refresh}) {
  const classes = useStyles()

  const [list, setList] = useState([])

  useEffect(() => {
    console.log(refresh)
    TodoClient.all().then(res => {
      setList(res.body)
    })
  }, [refresh])

  const handleApproveClick = item => () => {
    onItemClick("APPROVED", item)
  }
  const handleRejectClick = item => () => {
    onItemClick("REJECTED", item)
  }

  function renderAction(item) {
    return (
      <Grid container spacing={1}>
        <Grid item xs>
          <Button className={classes.buttonRejected} onClick={handleRejectClick(item)}>
            Reject
          </Button>
        </Grid>
        <Grid item xs>
          <Button className={classes.buttonApproved} onClick={handleApproveClick(item)}>
            Approve
          </Button>
        </Grid>
      </Grid>
    )
  }

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`todo-list-item-${key}`}>
        <Card>
          <CardHeader
            title={item.person}
            subheader={`${item.type}: ${item.description}`}
            action={renderAction(item)}
          />
        </Card>
      </Grid>
    )
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>Nothing todo</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={1}>
      {list.map(renderItem)}
    </Grid>
  )
}

TodoList.propTypes = {
  onItemClick: PropTypes.func,
  refresh: PropTypes.bool,
}
