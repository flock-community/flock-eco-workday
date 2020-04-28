import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import {CardContent} from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import {HolidayClient} from "../../clients/HolidayClient"
import {DayListItem} from "../../components/DayListItem"

export function HolidayList({personCode, refresh, onClickRow}) {
  const [list, setList] = useState([])
  const [update] = useState(refresh)

  useEffect(() => {
    if (personCode) {
      HolidayClient.findAllByPersonCode(personCode).then(res => setList(res))
    }
  }, [personCode, refresh, update])

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`holiday-list-item-${key}`}>
        <DayListItem value={item} onClick={onClickRow(item)} />
      </Grid>
    )
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No holidays.</Typography>
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

HolidayList.propTypes = {
  personCode: PropTypes.string,
  refresh: PropTypes.bool,
  onClickRow: PropTypes.func,
}
