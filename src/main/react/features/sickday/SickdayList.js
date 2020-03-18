import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import {SickDayClient} from "../../clients/SickDayClient"
import {isDefined} from "../../utils/validation"

export function SickdayList(props) {
  const {personCode, refresh, onClickRow} = props
  const [list, setList] = useState([])

  useEffect(() => {
    SickDayClient.findAllByPersonCode(personCode).then(res => setList(res))
  }, [personCode, refresh])

  function handleClickRow(item) {
    return () => {
      if (isDefined(onClickRow)) onClickRow(item)
    }
  }

  function renderItem(item, key) {
    return (
      <Grid key={`sick-day-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardContent>
            {item.description && (
              <Typography variant="h6">{item.description}</Typography>
            )}
            <Typography>
              Period: {item.from.format("DD-MM-YYYY")} - {item.to.format("DD-MM-YYYY")}
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

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No sick days</Typography>
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

SickdayList.propTypes = {
  refresh: PropTypes.bool,
  personCode: PropTypes.string,
  onClickRow: PropTypes.func,
}
