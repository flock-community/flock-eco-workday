import React, {useEffect, useState} from 'react'
import {Grid, TextField} from "@material-ui/core";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import Divider from "@material-ui/core/Divider";
import moment from "moment";
import Typography from "@material-ui/core/Typography";
import MenuItem from '@material-ui/core/MenuItem'

const daysOfWeek = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

export function PeriodForm({value, onChange}) {

  const now = moment().startOf('day')

  const [grid, setGrid] = useState([])
  const [dates, setDates] = useState([now, now])
  const [days, setDays] = useState({})

  useEffect(() => {
    const from = (value && moment(value.from)) || now
    const to = (value && moment(value.to)) || now
    setDates([from, to])
  }, [value]);

  useEffect(() => {
    setDays(calcDates(dates[0], dates[1]))
    setGrid(calcGrid())
  }, [dates]);

  useEffect(() => {
    setGrid(calcGrid())
  }, [days]);

  function handleDateFromChange(date) {
    setDates([date, dates[1]])
  }

  function handleDateToChange(date) {
    setDates([dates[0], date])
  }

  const handleDayChange = (key) => (ev) => {
    const value = ev.target.value
    setDays({
      ...days,
      [key]: parseInt(value)
    })
  }

  function calcDates(from, to) {
    const diff = to.diff(from, 'days') + 1
    return (diff < 0) ? [] : [...Array(diff).keys()]
      .map((it) => moment(from).add(it, 'days'))
      .reduce((acc, cur) => {
        const key = stringifyDate(cur)
        if (days[key]) {
          acc[key] = days[key]
        } else {
          acc[key] = inWeekday(cur) ? 8 : 0;
        }
        return acc
      }, {})
  }

  function calcGrid() {
    const start = moment(dates[0]).startOf('week');
    const end = moment(dates[1]).startOf('week');
    const diff = Math.abs(end.week() - start.week()) + 1;
    const weeks = [...Array(diff).keys()]

    return weeks
      .map(week => {
          const day = moment(start).add(week, 'weeks')
          const weekNumber = day.week()
          const it = [...Array(7).keys()]
            .map((dayDiff) => {
              const date = moment(day).add(dayDiff, 'days')
              const enabled = inRange(date)
              const key = stringifyDate(date)
              return {
                key,
                date,
                disabled: !enabled,
                value: enabled ? days[key] : 0
              }
            })
          const total = it
            .filter(it => !it.disabled)
            .reduce((acc, cur) => (acc + parseInt(days[cur.key]) || acc), 0)
          return {weekNumber, days:it, total}
        }
      )
  }

  function inRange(date) {
    const [start, end] = dates
    return date.isBetween(start, end, 'day', '[]')
  }

  function inWeekday(date) {
    return ![0, 6].includes(date.weekday())
  }

  function stringifyDate(date) {
    return date.format('YYYYMMDD');
  }

  if (dates.length === 0) return null;

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              fullWidth
              label="From"
              value={dates[0] || ''}
              onChange={handleDateFromChange}/>
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              fullWidth
              label="To"
              value={dates[1] || ''}
              minDate={dates[0]}
              onChange={handleDateToChange}/>
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>

      <br/>
      <Divider/>
      <br/>

      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Typography>Week</Typography>
        </Grid>
        {daysOfWeek.map(d => (<Grid item xs={1} key={`day-name-${d}`}>
          <Typography>{d}</Typography>
        </Grid>))}
        <Grid item xs={1}/>
        <Grid item xs={2}>
          <Typography>Total</Typography>
        </Grid>
      </Grid>

      {grid.map(week => {
        return (<Grid container spacing={1} key={`week-${week.weekNumber}`}>
          <Grid item xs={2}>
            <Typography>{week.weekNumber}</Typography>
          </Grid>
          {week.days && week.days.map(day => (<Grid item xs={1} key={`day-${day.key}`}>
            <TextField value={day.value || ''} disabled={day.disabled} onChange={handleDayChange(day.key)}/>
          </Grid>))}
          <Grid item xs={1}/>
          <Grid item xs={2}>
            <Typography>
              {week.total}
            </Typography>
          </Grid>
        </Grid>)
      })}

    </>)

}
