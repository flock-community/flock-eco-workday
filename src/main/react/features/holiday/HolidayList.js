import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import Grid from "@material-ui/core/Grid"
import {HolidayClient} from "../../clients/HolidayClient"
import {HolidayListItem} from "./HolidayListItem"

export function HolidayList(props) {
  const {personCode, refresh, onSelectItem} = props
  const [list, setList] = useState([])
  const [update, setUpdate] = useState(refresh)

  useEffect(() => {
    if (personCode) {
      HolidayClient.findAllByPersonCode(personCode).then(res => setList(res))
    } else {
      HolidayClient.findAll().then(res => setList(res))
    }
  }, [personCode, refresh, update])

  function handleDelete(holidayCode) {
    HolidayClient.delete(holidayCode)
      .then(() => {})
      .catch(err => console.log(err))
    setUpdate(!update)
  }

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`holiday-list-item-${key}`}>
        <HolidayListItem item={item} onEdit={onSelectItem} onDelete={handleDelete} />
      </Grid>
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
  onSelectItem: PropTypes.func,
}
