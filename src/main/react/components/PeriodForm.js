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
  const [pet, setPet] = useState({})

  useEffect(() => {
    const initFrom = (value && value.from) || now
    const initTo = (value && value.to) || now
    setDates([initFrom, initTo])
    setDays(calcDates(initFrom, initTo)
      .reduce((acc, cur, i) => {
        const key = stringifyDate(cur)
        if (value && value.days[i]) {
          acc[key] = value.days[i]
        } else {
          acc[key] = inWeekday(cur) ? 8 : 0;
        }
        return acc
      }, {}))

  }, [value]);

  useEffect(() => {
    setDays(calcDates(dates[0], dates[1])
      .reduce((acc, cur) => {
        const key = stringifyDate(cur)
        if (days[key]) {
          acc[key] = days[key]
        } else {
          acc[key] = inWeekday(cur) ? 8 : 0;
        }
        return acc
      }, {}))
    setGrid(calcGrid())

  }, [dates]);

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
      [key]: value
    })
  }

  function calcWeeks() {
    const start = moment(dates[0]).week();
    const end = moment(dates[1]).week()
    const diff = Math.abs(end - start) + 1;
    return [...Array(diff).keys()]
  }

  function calcDates(from, to) {
    const start = moment(from)
    const end = moment(to)
    const diff = end.diff(start, 'days') + 1
    return (diff < 0) ? [] : [...Array(diff).keys()]
      .map((it) => moment(start).add(it, 'days'))
  }

  function calcGrid() {
    const start = moment(dates[0]).startOf('week');

    return calcWeeks()
      .map(week => {
          const day = moment(start).add(week, 'weeks')
          const weekNumber = day.week()
          const x = [...Array(7).keys()]
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
          const total = days.filter(it => !it.disabled)
            .reduce((acc, cur) => (acc + parseInt(days[cur.key]) || acc), 0)
          return {weekNumber, days, total}
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
          {week.days.map(day => (<Grid item xs={1} key={`day-${day.key}`}>
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
