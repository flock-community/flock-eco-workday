import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Grid, TextField} from "@material-ui/core"
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers"
import MomentUtils from "@date-io/moment"
import Divider from "@material-ui/core/Divider"
import moment from "moment"
import Typography from "@material-ui/core/Typography"

const daysOfWeek = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"]

export function PeriodForm({value, onChange}) {
  const now = moment().startOf("day")

  const [grid, setGrid] = useState([])
  const [{dates, days}, setState] = useState({
    dates: [now, now],
    days: [],
  })

  const inRange = date => {
    const [start, end] = dates
    return date.isBetween(start, end, "day", "[]")
  }

  const inWeekday = date => {
    return ![0, 6].includes(date.weekday())
  }

  const stringifyDate = date => {
    return date.format("YYYYMMDD")
  }

  function calcDays(from, to) {
    const diff = to.diff(from, "days") + 2
    return diff < 0
      ? []
      : [...Array(diff).keys()]
          .map(it => moment(from).add(it, "days"))
          .reduce((acc, cur) => {
            const key = stringifyDate(cur)
            if (days[key]) {
              acc[key] = days[key]
            } else {
              acc[key] = inWeekday(cur) ? 8 : 0
            }
            return acc
          }, {})
  }

  function calcGrid() {
    const start = moment(dates[0]).startOf("week")
    const end = moment(dates[1]).startOf("week")
    const diff = Math.ceil(end.diff(start, "days") / 7) + 1
    const weeks = [...Array(diff).keys()]

    return weeks.map(week => {
      const day = moment(start).add(week, "weeks")
      const weekNumber = day.week()
      const res = [...Array(7).keys()].map(dayDiff => {
        const date = moment(day).add(dayDiff, "days")
        const enabled = inRange(date)
        const key = stringifyDate(date)
        return {
          key,
          date,
          disabled: !enabled,
          value: enabled ? days[key] : 0,
        }
      })
      const total = res
        .filter(it => !it.disabled)
        .reduce((acc, cur) => acc + parseInt(days[cur.key], 10) || acc, 0)
      return {weekNumber, days: res, total}
    })
  }

  useEffect(() => {
    console.log(value)
    if (value) {
      const from = moment(value.dates[0])
      const to = moment(value.dates[1])
      console.log(from, to)
      if (value.days) {
        setState({
          dates: [from, to],
          days: value.days.reduce((acc, cur, index) => {
            const key = stringifyDate(moment(from).add(index, "day"))
            return {
              ...acc,
              [key]: cur,
            }
          }, {}),
        })
      } else {
        setState({
          dates: [from, to],
          days: calcDays(from, to),
        })
      }
    } else {
      setState({
        dates: [now, now],
        days: calcDays(now, now),
      })
    }
  }, [value])

  useEffect(() => {
    setGrid(calcGrid())
  }, [dates, days])

  function handleDateFromChange(date) {
    const calc = calcDays(date, dates[1])
    setState({
      dates: [date, dates[1]],
      days: calc,
    })
    onChange({
      dates: [date, dates[1]],
      days: Object.keys(calc).map(key => days[key]),
    })
  }

  function handleDateToChange(date) {
    const calc = calcDays(dates[0], date)
    setState({
      dates: [dates[0], date],
      days: calc,
    })
    onChange({
      dates: [dates[0], date],
      days: Object.keys(calc).map(key => days[key]),
    })
  }

  const handleDayChange = it => ev => {
    const val = {
      ...days,
      [it]: parseInt(ev.target.value, 10) % 10,
    }
    setState({
      dates: [dates[0], dates[1]],
      days: val,
    })
    onChange({
      dates: [dates[0], dates[1]],
      days: Object.keys(val).map(key => val[key]),
    })
  }

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              fullWidth
              label="From"
              value={dates[0] || ""}
              onChange={handleDateFromChange}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              fullWidth
              label="To"
              value={dates[1] || ""}
              minDate={dates[0]}
              onChange={handleDateToChange}
            />
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>

      <br />
      <Divider />
      <br />

      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Typography>Week</Typography>
        </Grid>
        {daysOfWeek.map(d => (
          <Grid item xs={1} key={`day-name-${d}`}>
            <Typography>{d}</Typography>
          </Grid>
        ))}
        <Grid item xs={1} />
        <Grid item xs={2}>
          <Typography>Total</Typography>
        </Grid>
      </Grid>

      {grid.map(week => {
        return (
          <Grid container spacing={1} key={`week-${week.weekNumber}`}>
            <Grid item xs={2}>
              <Typography>{week.weekNumber}</Typography>
            </Grid>
            {week.days &&
              week.days.map(day => (
                <Grid item xs={1} key={`day-${day.key}`}>
                  <TextField
                    value={day.value || ""}
                    disabled={day.disabled}
                    onChange={handleDayChange(day.key)}
                  />
                </Grid>
              ))}
            <Grid item xs={1} />
            <Grid item xs={2}>
              <Typography>{week.total}</Typography>
            </Grid>
          </Grid>
        )
      })}
    </>
  )
}
PeriodForm.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
}
