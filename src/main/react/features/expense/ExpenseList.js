import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil"
import CardHeader from "@material-ui/core/CardHeader"
import {ExpenseClient} from "../../clients/ExpenseClient"
import {StatusMenu} from "../../components/StatusMenu"

export function ExpenseList({personCode, refresh, onClickRow}) {
  const [state, setState] = useState([])

  const loadState = () => {
    ExpenseClient.findAllByPersonCode(personCode).then(res => setState(res))
  }

  useEffect(() => {
    if (personCode) {
      loadState()
    }
  }, [personCode, refresh])

  const isAdmin = () => !UserAuthorityUtil.hasAuthority("ExpenseAuthority.ADMIN")

  const handleClickRow = item => {
    return () => {
      if (onClickRow) onClickRow(item)
    }
  }

  const handleStatusChange = item => status => {
    ExpenseClient.put(item.id, item.type.toLowerCase(), {
      ...item,
      personCode,
      status,
    }).then(() => loadState())
  }

  function renderItem(item, key) {
    return (
      <Grid key={`workday-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardHeader
            action={
              <StatusMenu
                onChange={handleStatusChange(item)}
                disabled={isAdmin()}
                value={item.status}
              />
            }
            title={item.description ? item.description : "empty"}
            subheader={`Date: ${item.date.format("DD-MM-YYYY")}`}
          />
          <CardContent>
            <Typography variant="h6"></Typography>
            <Typography></Typography>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  if (state.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No expenses</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={1}>
      {state.map(renderItem)}
    </Grid>
  )
}

ExpenseList.propTypes = {
  refresh: PropTypes.bool,
  personCode: PropTypes.string,
  onClickRow: PropTypes.func,
}
