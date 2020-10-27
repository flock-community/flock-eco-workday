import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, TextField } from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import Divider from "@material-ui/core/Divider";
import moment from "moment";
import Typography from "@material-ui/core/Typography";

const daysOfWeek = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

const inRange = (dates, date) => {
  const [start, end] = dates;
  return date.isBetween(start, end, "day", "[]");
};

const inWeekday = date => {
  return ![0, 6].includes(date.weekday());
};

const stringifyDate = date => {
  return date.format("YYYYMMDD");
};

const calcDays = (from, to, days) => {
  const diff = to.diff(from, "days");
  return diff < 0
    ? {}
    : [...Array(diff + 1).keys()]
        .map(it => moment(from).add(it, "days"))
        .reduce((acc, cur, index) => {
          const key = stringifyDate(cur);
          if (days && days[index] != null) {
            acc[key] = days[index];
          } else {
            acc[key] = inWeekday(cur) ? "8" : "0";
          }
          return acc;
        }, {});
};

const defaultToState = () => {
  const now = moment().startOf("day");
  return {
    dates: [now, now],
    days: calcDays(now, now)
  };
};

const valueToState = value => {
  const from = moment(value.dates[0]).startOf("day");
  const to = moment(value.dates[1]).startOf("day");
  return {
    dates: [from, to],
    days: calcDays(from, to, value.days)
  };
};

export function PeriodForm({ value, onChange }) {
  const [grid, setGrid] = useState([]);
  const [{ dates, days }, setState] = useState(
    value ? valueToState(value) : defaultToState()
  );

  useEffect(() => {
    if (onChange)
      onChange({
        dates,
        days: Object.keys(days).map(key => days[key])
      });
  }, []);

  useEffect(() => {
    if (value) {
      setState(valueToState(value));
    }
  }, [value]);

  useEffect(() => {
    const start = moment(dates[0]).startOf("week");
    const end = moment(dates[1]).startOf("week");
    const diff = Math.ceil(end.diff(start, "days") / 7) + 1;
    const weeks = [...Array(diff > 0 ? diff : 1).keys()];

    setGrid(
      weeks.map(week => {
        const day = moment(start).add(week, "weeks");
        const weekNumber = day.week();
        const res = [...Array(7).keys()].map(dayDiff => {
          const date = moment(day).add(dayDiff, "days");
          const enabled = inRange(dates, date);
          const key = stringifyDate(date);
          return {
            key,
            date,
            disabled: !enabled,
            value: enabled ? String(days[key]) : ""
          };
        });
        const total = res
          .filter(it => !it.disabled)
          .reduce((acc, cur) => acc + parseFloat(days[cur.key]) || acc, 0);
        return { weekNumber, days: res, total };
      })
    );
  }, [dates, days]);

  function update(from, to, val) {
    setState({
      dates: [from, to],
      days: val
    });
    onChange({
      dates: [from, to],
      days: Object.keys(val).map(key => val[key])
    });
  }

  function handleDateFromChange(date) {
    const calc = calcDays(
      date,
      dates[1],
      Object.keys(days).map(key => days[key])
    );
    update(date, dates[1], calc);
  }

  function handleDateToChange(date) {
    const calc = calcDays(
      dates[0],
      date,
      Object.keys(days).map(key => days[key])
    );
    update(dates[0], date, calc);
  }

  const handleDayChange = it => ev => {
    const val = {
      ...days,
      [it]: String(ev.target.value)
    };
    update(dates[0], dates[1], val);
  };

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
        );
      })}
    </>
  );
}

PeriodForm.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func
};
