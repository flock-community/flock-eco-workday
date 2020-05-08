import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import IconButton from "@material-ui/core/IconButton"
import ScoreIcon from "@material-ui/icons/Score"
import CardHeader from "@material-ui/core/CardHeader"
import {useHistory} from "react-router-dom"
import {isDefined} from "../../utils/validation"
import {EventClient} from "../../clients/EventClient"

export function EventList(props) {
  const {personCode, refresh, onClickRow} = props
  const [state, setState] = useState([])

  const history = useHistory()

  useEffect(() => {
    EventClient.all().then(res => setState(res))
  }, [personCode, refresh])

  const handleClickRow = item => () => {
    if (isDefined(onClickRow)) onClickRow(item)
  }

  const handleClickRating = item => () => {
    history.push(`/event_rating/${item.code}`)
  }

  function renderItem(item, key) {
    return (
      <Grid key={`workday-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardHeader
            action={
              <IconButton aria-label="settings" onClick={handleClickRating(item)}>
                <ScoreIcon />
              </IconButton>
            }
            title={item.description}
          />
          <CardContent>
            <Typography>
              Period: {item.from.format("DD-MM-YYYY")} -{" "}
              {item.to ? item.to.format("DD-MM-YYYY") : <em>now</em>}
            </Typography>
            <Typography>Aantal dagen: {item.to.diff(item.from, "days") + 1}</Typography>
            <Typography>Aantal uren: {item.hours}</Typography>
            <Typography>
              {item.persons
                .sort((a, b) => (a.lastname > b.lastname ? 1 : -1))
                .map(person => `${person.firstname} ${person.lastname}`)
                .join(",")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  if (state.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No events</Typography>
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

EventList.propTypes = {
  refresh: PropTypes.bool,
  personCode: PropTypes.string,
  onClickRow: PropTypes.func,
}
