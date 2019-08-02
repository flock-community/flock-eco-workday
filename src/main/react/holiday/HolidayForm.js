import React, {useEffect, useState} from 'react'
import {Grid, TextField} from "@material-ui/core";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import Divider from "@material-ui/core/Divider";
import moment from "moment";
import Typography from "@material-ui/core/Typography";

export function HolidayForm({value = {}, onChange}) {

  const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

  const [grid, setGrid] = useState([])
  const [state, setState] = useState({
    description: null,
    dates: [
      (value && value.from) || moment().startOf('day'),
      (value && value.to) || moment().startOf('day')
    ],
    dayOff: {}
  })

  useEffect(() => {

    const dayOff = calcDates()
      .reduce((acc, cur) => {
        const key = stringifyDate(cur)
        if (state.dayOff[key]) {
          acc[key] = state.dayOff[key]
        } else {
          acc[key] = inWeekday(cur) ? 8 : 0;
        }
        return acc
      }, {})

    setState({
      ...state,
      dayOff
    })

  }, [value, state.dates]);

  useEffect(() => {
    onChange && onChange({
      ...state,
      dayOff: Object
        .keys(state.dayOff)
        .map(key => (state.dayOff[key]))
    })
    setGrid(calcGrid())
  }, [state]);

  function handleDescriptionChange(ev) {
    setState({
      ...state,
      description: ev.target.value
    })
  }

  function handleDateFromChange(date) {
    setState({
      ...state,
      dates: [date, state.dates[1]],
    })
  }

  function handleDateToChange(date) {
    setState({
      ...state,
      dates: [state.dates[0], date],
    })
  }

  const handleDayChange = (key) => (ev) => {
    const value = ev.target.value
    setState({
      ...state,
      dayOff: {
        ...state.dayOff,
        [key]: value
      }
    })
  }

  function calcWeeks() {
    const start = moment(state.dates[0]).week();
    const end = moment(state.dates[1]).week()
    const diff = Math.abs(end - start) + 1;
    return [...Array(diff).keys()]
  }

  function calcDates() {
    const start = moment(state.dates[0])
    const end = moment(state.dates[1])
    const diff = end.diff(start, 'days')
    return [...Array(diff).keys()]
      .map((it) => moment(start).add(it, 'days'))
  }

  function calcGrid() {
    const start = moment(state.dates[0]).startOf('week');

    return calcWeeks()
      .map(week => {
        const day = moment(start).add(week, 'weeks')
        const weekNumber = day.week()
        return {
          weekNumber,
          days: [...Array(7).keys()]
            .map((dayDiff) => {
              const date = moment(day).add(dayDiff, 'days')
              const enabled = inRange(date)
              const key = stringifyDate(date)
              return {
                key,
                date,
                disabled: !enabled,
                value: enabled ? state.dayOff[key] : ''
              }
            })
        }
      })
  }

  function inRange(date) {
    const [start, end] = state.dates
    return date.isBetween(start, end, 'day', '[]')
  }

  function inWeekday(date) {
    return date.day(0) || date.day(6)
  }

  function stringifyDate(date) {
    return date.format('YYYYMMDD');
  }

  if (state.dates.length === 0) return [];

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={state.description || ''}
            onChange={handleDescriptionChange}/>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              fullWidth
              label="From"
              value={state.dates[0] || ''}
              onChange={handleDateFromChange}/>
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              fullWidth
              label="To"
              value={state.dates[1] || ''}
              minDate={state.dates[0]}
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
        {days.map(d => (<Grid item xs={1} key={`day-name-${d}`}>
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
              {week.days
                .filter(it => !it.disabled)
                .reduce((acc, cur) => (acc + parseInt(state.dayOff[cur.key]) || 0), 0)}
            </Typography>
          </Grid>
        </Grid>)
      })}

    </>)

}
