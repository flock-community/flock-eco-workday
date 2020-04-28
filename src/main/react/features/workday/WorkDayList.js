import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import {WorkDayClient} from "../../clients/WorkDayClient"
import {WorkDayListItem} from "./WorkDayListItem"

export function WorkDayList(props) {
  const {personCode, refresh, onClickRow} = props
  const [state, setState] = useState([])

  useEffect(() => {
    WorkDayClient.findAllByPersonCode(personCode).then(res => setState(res))
  }, [personCode, refresh])
  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`workday-list-item-${key}`}>
        <WorkDayListItem value={item} onClick={() => onClickRow && onClickRow(item)} />
      </Grid>
    )
  }

  if (state.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No workdays</Typography>
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

WorkDayList.propTypes = {
  refresh: PropTypes.bool,
  personCode: PropTypes.string,
  onClickRow: PropTypes.func,
}
