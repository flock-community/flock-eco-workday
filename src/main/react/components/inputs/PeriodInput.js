import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, TextField } from "@material-ui/core";
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
            acc[key] = inWeekday(cur) ? 8 : 0;
          }
          return acc;
        }, {});
};

const calcGrid = (from, to, days) => {
  const diff =
    Math.ceil(
      moment(to)
        .startOf("week")
        .diff(moment(from).startOf("week"), "days") / 7
    ) + 1;
  const weeks = [...Array(diff > 0 ? diff : 1).keys()];
  return weeks.map(week => {
    const day = moment(from)
      .startOf("week")
      .add(week, "weeks");
    const weekNumber = day.week();
    const res = [...Array(7).keys()].map(dayDiff => {
      const date = moment(day).add(dayDiff, "days");
      const enabled = inRange([from, to], date);
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
      .reduce((acc, cur) => acc + parseInt(days[cur.key], 10) || acc, 0);
    return { weekNumber, days: res, total };
  });
};

const initDates = value => {
  const now = moment().startOf("day");
  const from = value.from ? moment(value.from).startOf("day") : now;
  const to = value.to ? moment(value.to).startOf("day") : now;
  return [from, to];
};

const initDays = (days, from) => {
  return (
    days &&
    days.reduce((acc, cur, index) => {
      const date = moment(from).add(index, "days");
      const key = stringifyDate(date);
      acc[key] = String(cur);
      return acc;
    }, {})
  );
};

export function PeriodInput({ value, onChange }) {
  const [from, to] = initDates(value);
  const [state, setState] = useState(
    value.days ? initDays(value.days, from) : {}
  );

  useEffect(() => {
    if (value && value.days) {
      const days = calcDays(from, to, value.days);
      setState(days);
      if (onChange) onChange(Object.keys(days).map(key => days[key]));
    }
  }, [value.from, value.to]);

  const handleDayChange = it => ev => {
    const days = {
      ...state,
      [it]: String(ev.target.value)
    };
    setState(days);
    onChange(Object.keys(days).map(key => days[key]));
  };

  const grid = calcGrid(from, to, state);

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={2}>
          <Typography>Week</Typography>
        </Grid>
        {daysOfWeek.map(d => (
          <Grid item xs key={`day-name-${d}`}>
            <Typography>{d}</Typography>
          </Grid>
        ))}
        <Grid item xs={2}>
          <Typography align="right">Total</Typography>
        </Grid>
      </Grid>

      {grid.map(week => {
        return (
          <Grid
            container
            spacing={1}
            key={`week-${week.weekNumber}`}
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography>{week.weekNumber}</Typography>
            </Grid>
            {week.days &&
              week.days.map(day => (
                <Grid item xs key={`day-${day.key}`}>
                  <TextField
                    label={day.disabled ? "-" : day.date.format("DD MMM")}
                    value={day.value}
                    disabled={day.disabled}
                    onChange={handleDayChange(day.key)}
                    type="number"
                    InputLabelProps={{
                      shrink: !day.disabled
                    }}
                  />
                </Grid>
              ))}
            <Grid item xs={2}>
              <Typography align="right">{week.total}</Typography>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
}

PeriodInput.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func
};
