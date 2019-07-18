import React, {useEffect, useState} from 'react'
import {Grid, TextField} from "@material-ui/core";
import {DatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

export function HolidayForm({value = {}, onChange}) {

  const days = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

  const newDate = (date) => {
    date.setHours(0, 0, 0, 0)
    return date
  }

  const [state, setState] = useState({
    description: null,
    dates: [
      newDate(value.from || new Date()),
      newDate(value.to || new Date())
    ],
    dayOff: {}
  })

  useEffect(() => {
    setState({
      ...state,
      dayOff: calcDates()
        .reduce((acc, cur) => {
          const key = stringifyDate(cur)
          if (state.dayOff[key]) {
            acc[key] = state.dayOff[key]
          } else {
            acc[key] = inWeekday(cur) ? 8 : 0;
          }
          return acc
        }, {})
    })
  }, [value, state.dates]);

  useEffect(() => {
    onChange && onChange({
      ...state,
      dayOff: Object
        .keys(state.dayOff)
        .map(key => (state.dayOff[key]))
    })
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
    const start = calcSunday()
    const end = state.dates[1].getTime()
    const diffTime = Math.abs(end - start);
    const diffWeeks = Math.ceil((diffTime + 1) / (1000 * 60 * 60 * 24 * 7));
    return [...Array(diffWeeks).keys()]
  }

  function calcDates() {
    const start = state.dates[0].getTime()
    const end = state.dates[1].getTime()
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil((diffTime + 1) / (1000 * 60 * 60 * 24));
    return [...Array(diffDays).keys()]
      .map((it) => new Date(start + (it * (1000 * 60 * 60 * 24))))
  }

  function calcWeekNr(date) {
    const onejan = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - onejan) / 86400000) + onejan.getDay()) / 7);
  }

  function calcSunday() {
    const day = state.dates[0].getDay()
    const diff = state.dates[0].getDate() - day;
    return new Date(state.dates[0]).setDate(diff);
  }

  function inRange(date) {
    const [start, end] = state.dates
    const beforeStart = (start.getTime() <= date.getTime())
    const afterEnd = (end.getTime() >= date.getTime())
    return beforeStart && afterEnd
  }

  function inWeekday(date) {
    return ![0, 6].includes(date.getDay())
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function getGrid() {
    const start = calcSunday()
    return calcWeeks()
      .map((week) => {
        const day = addDays(start, (week * 7))
        const weekNumber = calcWeekNr(day)
        return {
          weekNumber,
          days: [...Array(7).keys()]
            .map((dayDiff) => {
              const date = addDays(day, dayDiff)
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

  function stringifyDate(date) {
    let dd = date.getDate();
    let mm = date.getMonth() + 1;
    const yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return `${yyyy}${mm}${dd}`;
  }

  if (state.dates.length === 0) return [];

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={state.description}
            onChange={handleDescriptionChange}/>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              fullWidth
              label="From"
              value={state.dates[0]}
              onChange={handleDateFromChange}/>
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
              fullWidth
              label="To"
              value={state.dates[1]}
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
      {getGrid().map(week => {
        return (<Grid container spacing={1} key={`week-${week}`}>
          <Grid item xs={2}>
            <Typography>{week.weekNumber}</Typography>
          </Grid>
          {week.days.map(day => (<Grid item xs={1} key={`day-${day.key}`}>
            <TextField value={day.value} disabled={day.disabled} onChange={handleDayChange(day.key)}/>
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
