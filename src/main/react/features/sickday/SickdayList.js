import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Card, Typography} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import Grid from "@material-ui/core/Grid"
import {SickdayClient} from "../../clients/SickdayClient"
import {isDefined} from "../../utils/validation"

export function SickdayList(props) {
  const {personCode, refresh, onClickRow} = props
  const [list, setList] = useState([])

  useEffect(() => {
    SickdayClient.findAllByPersonCode(personCode).then(res => setList(res))
  }, [personCode, refresh])

  function handleClickRow(item) {
    return () => {
      if (isDefined(onClickRow)) onClickRow(item)
    }
  }

  function renderItem(item, key) {
    return (
      <Grid key={`sickday-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardContent>
            <Typography>
              Period: {item.period.from.format("DD-MM-YYYY")} -{" "}
              {item.period.to.format("DD-MM-YYYY")}
            </Typography>
            <Typography>
              Aantal dagen: {item.period.days.filter(day => day.hours > 0).length}
            </Typography>
            <Typography>
              Aantal uren: {item.period.days.reduce((acc, cur) => cur.hours + acc, 0)}
            </Typography>
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
          <Typography>No sickdays</Typography>
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
