import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import CardHeader from "@material-ui/core/CardHeader"
import {ExpenseClient} from "../../clients/ExpenseClient"
import {StatusMenu} from "../../components/StatusMenu"

export function ExpenseList({personCode, refresh, onClickRow}) {
  const [state, setState] = useState([])

  useEffect(() => {
    if (personCode) {
      ExpenseClient.findAllByPersonCode(personCode).then(res => setState(res))
    }
  }, [personCode, refresh])

  const isAdmin = () => !UserAuthorityUtil.hasAuthority("ExpenseAuthority.ADMIN")

  const handleClickRow = item => {
    return () => {
      if (onClickRow) onClickRow(item)
    }
  }

  const handleStatusChange = status =>
    ExpenseClient.put(state.id, state.type.toLowerCase(), {...state, status})

  function renderItem(item, key) {
    return (
      <Grid key={`workday-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardHeader
            action={
              <StatusMenu
                onChange={handleStatusChange}
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
