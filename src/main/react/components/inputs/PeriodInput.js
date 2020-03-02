import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Grid, TextField} from "@material-ui/core"
import moment from "moment"
import Typography from "@material-ui/core/Typography"

const daysOfWeek = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"]

const inRange = (dates, date) => {
  const [start, end] = dates
  return date.isBetween(start, end, "day", "[]")
}

const inWeekday = date => {
  return ![0, 6].includes(date.weekday())
}

const stringifyDate = date => {
  return date.format("YYYYMMDD")
}

const calcDays = (from, to, days) => {
  const diff = to.diff(from, "days")
  return diff < 0
    ? {}
    : [...Array(diff + 1).keys()]
        .map(it => moment(from).add(it, "days"))
        .reduce((acc, cur) => {
          const key = stringifyDate(cur)
          if (days && days[key] != null) {
            acc[key] = days[key]
          } else {
            acc[key] = inWeekday(cur) ? "8" : "0"
          }
          return acc
        }, {})
}

const valueToState = value => {
  const now = moment().startOf("day")
  const from = value.from ? moment(value.from).startOf("day") : now
  const to = value.to ? moment(value.to).startOf("day") : now
  return {
    dates: [from, to],
    days: calcDays(from, to, value.days),
  }
}

export function PeriodInput({value, onChange}) {
  const [grid, setGrid] = useState([])
  const [{dates, days}, setState] = useState(valueToState(value))

  useEffect(() => {
    if (value) {
      const val = valueToState(value)
      setState(val)
      onChange(Object.keys(val.days).map(key => val.days[key]))
    }
  }, [value.from, value.to])

  useEffect(() => {
    const start = moment(dates[0]).startOf("week")
    const end = moment(dates[1]).startOf("week")
    const diff = Math.ceil(end.diff(start, "days") / 7) + 1
    const weeks = [...Array(diff > 0 ? diff : 1).keys()]

    setGrid(
      weeks.map(week => {
        const day = moment(start).add(week, "weeks")
        const weekNumber = day.week()
        const res = [...Array(7).keys()].map(dayDiff => {
          const date = moment(day).add(dayDiff, "days")
          const enabled = inRange(dates, date)
          const key = stringifyDate(date)
          return {
            key,
            date,
            disabled: !enabled,
            value: enabled ? String(days[key]) : "",
          }
        })
        const total = res
          .filter(it => !it.disabled)
          .reduce((acc, cur) => acc + parseInt(days[cur.key], 10) || acc, 0)
        return {weekNumber, days: res, total}
      })
    )
  }, [dates, days])

  const handleDayChange = it => ev => {
    const val = {
      ...days,
      [it]: String(ev.target.value),
    }
    setState({
      dates,
      days: val,
    })
    onChange(Object.keys(val).map(key => val[key]))
  }

  return (
    <>
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
                    value={day.value}
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

PeriodInput.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
}
