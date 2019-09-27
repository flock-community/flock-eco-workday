import React, {useEffect, useState} from 'react'
import {Dialog, DialogContent, Grid, TextField} from "@material-ui/core";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';
import Divider from "@material-ui/core/Divider";
import moment from "moment";
import Typography from "@material-ui/core/Typography";
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem'

const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
const dayTypes = ['HOLIDAY', 'SICK_DAY', 'EVENT_DAY']

export function PeriodForm({value, onChange}) {

  const initFrom = (value && value.from) || moment().startOf('day')
  const initTo = (value && value.to) || moment().startOf('day')

  const [grid, setGrid] = useState([])
  const [state, setState] = useState({
    description: value && value.description,
    type: value && value.type || dayTypes[0],
    dates: [initFrom, initTo],
    days: calcDates(initFrom, initTo)
      .reduce((acc, cur, i) => {
        const key = stringifyDate(cur)
        if (value && value.days[i]) {
          acc[key] = value.days[i]
        } else {
          acc[key] = inWeekday(cur) ? 8 : 0;
        }
        return acc
      }, {})
  })

  useEffect(() => {

    const days = calcDates(state.dates[0], state.dates[1])
      .reduce((acc, cur) => {
        const key = stringifyDate(cur)
        if (state.days[key]) {
          acc[key] = state.days[key]
        } else {
          acc[key] = inWeekday(cur) ? 8 : 0;
        }
        return acc
      }, {})

    setState({
      ...state,
      days
    })

  }, [value, state.dates]);

  useEffect(() => {
    onChange && onChange({
      ...state,
      days: Object
        .keys(state.days)
        .map(key => (state.days[key]))
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
      days: {
        ...state.days,
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

  function calcDates(from, to) {
    const start = moment(from)
    const end = moment(to)
    const diff = end.diff(start, 'days') + 1
    return (diff < 0) ? [] : [...Array(diff).keys()]
      .map((it) => moment(start).add(it, 'days'))
  }

  function calcGrid() {
    const start = moment(state.dates[0]).startOf('week');

    return calcWeeks()
      .map(week => {
          const day = moment(start).add(week, 'weeks')
          const weekNumber = day.week()
          const days = [...Array(7).keys()]
            .map((dayDiff) => {
              const date = moment(day).add(dayDiff, 'days')
              const enabled = inRange(date)
              const key = stringifyDate(date)
              return {
                key,
                date,
                disabled: !enabled,
                value: enabled ? state.days[key] : 0
              }
            })
          const total = days.filter(it => !it.disabled)
            .reduce((acc, cur) => (acc + parseInt(state.days[cur.key]) || acc), 0)
          return {weekNumber, days, total}
        }
      )
  }

  function inRange(date) {
    const [start, end] = state.dates
    return date.isBetween(start, end, 'day', '[]')
  }

  function inWeekday(date) {
    return ![0, 6].includes(date.weekday())
  }

  function stringifyDate(date) {
    return date.format('YYYYMMDD');
  }

  if (state.dates.length === 0) return [];

    function handleTypeChange(ev) {
        setState({
            ...state,
            type: ev.target.value
        })
    }

    function renderMenuItem(type) {
        return (<MenuItem value={type} key={type}>{type}</MenuItem>)
    }

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
        <Grid item xs={12}>
            <InputLabel shrink={true}>Select Type</InputLabel>
            <Select value={state.type} onChange={handleTypeChange}>
                {dayTypes.map(function (type) {
                    return renderMenuItem(type)
                })}
            </Select>
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
              {week.total}
            </Typography>
          </Grid>
        </Grid>)
      })}

    </>)

}
