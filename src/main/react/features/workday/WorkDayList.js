import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import {isDefined} from "../../utils/validation"
import {WorkDayClient} from "../../clients/WorkDayClient"

export function WorkDayList(props) {
  const {personCode, refresh, onClickRow} = props
  const [state, setState] = useState([])

  useEffect(() => {
    WorkDayClient.findAllByPersonCode(personCode).then(res => setState(res))
  }, [personCode, refresh])

  function handleClickRow(item) {
    return () => {
      if (isDefined(onClickRow)) onClickRow(item)
    }
  }

  function renderItem(item, key) {
    return (
      <Grid key={`workday-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardContent>
            <Typography variant="h6">
              {item.assignment.client.name} - {item.assignment.role}
            </Typography>
            <Typography>
              Period: {item.from.format("DD-MM-YYYY")} -{" "}
              {item.to ? item.to.format("DD-MM-YYYY") : <em>now</em>}
            </Typography>
            <Typography>
              Aantal dagen: {item.days.filter(day => day > 0).length}
            </Typography>
            <Typography>Aantal uren: {item.hours}</Typography>
            <Typography>{item.status}</Typography>
          </CardContent>
        </Card>
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
