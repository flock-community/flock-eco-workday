import React from "react";
import { Grid, makeStyles, TextField } from "@material-ui/core";
import moment from "moment";
import Typography from "@material-ui/core/Typography";
import { dateInPeriod, getDay, Period } from "../../features/period/Period";

const daysOfWeek = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

const stringifyDate = (date) => {
  return date.format("YYYYMMDD");
};

const useStyles = makeStyles({
  totals: {
    marginTop: "10px",
  },
});

const calcGrid = (period) => {
  const diff =
    Math.ceil(
      moment(period.to)
        .startOf("week")
        .diff(moment(period.from).startOf("week"), "days") / 7
    ) + 1;
  const weeks = Array.from(Array(diff > 0 ? diff : 1).keys());
  return weeks.map((week) => {
    const day = moment(period.from).startOf("week").add(week, "weeks");
    const weekNumber = day.week();
    const year = day.year();
    const res = Array.from(Array(7).keys()).map((dayDiff) => {
      const date = moment(day).add(dayDiff, "days");
      const enabled = dateInPeriod(period, date);
      const key = stringifyDate(date);
      return {
        key,
        date,
        disabled: !enabled,
        value: enabled ? String(getDay(period, date)) : "",
      };
    });
    const total = res
      .filter((it) => !it.disabled)
      .reduce((acc, cur) => acc + getDay(period, cur.date) || acc, 0);
    return { year, weekNumber, days: res, total };
  });
};

export type PeriodInputProps = {
  period: Period;
  onChange: (day: moment.Moment, hours: number) => void;
};

export function PeriodInput({ period, onChange }: PeriodInputProps) {
  const grid = calcGrid(period);

  const classes = useStyles();

  const totalHoursForPeriod = period.days?.reduce(
    (previous, current) => previous + current
  );

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs={2}>
          <Typography>Week</Typography>
        </Grid>
        {daysOfWeek.map((d) => (
          <Grid item xs key={`day-name-${d}`}>
            <Typography>{d}</Typography>
          </Grid>
        ))}
        <Grid item xs={2}>
          <Typography align="right">Total</Typography>
        </Grid>
      </Grid>

      {grid.map((week) => {
        return (
          <Grid
            container
            spacing={1}
            key={`${week.year} week-${week.weekNumber}`}
            alignItems="center"
          >
            <Grid item xs={2}>
              <Typography>{week.weekNumber}</Typography>
            </Grid>
            {week.days &&
              week.days.map((day) => (
                <Grid item xs key={`day-${day.key}`}>
                  <TextField
                    label={day.disabled ? "-" : day.date.format("DD MMM")}
                    value={day.value}
                    disabled={day.disabled}
                    onChange={(ev) =>
                      onChange(day.date, parseFloat(ev.target.value || "0"))
                    }
                    type="number"
                    InputLabelProps={{
                      shrink: !day.disabled,
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

      <Grid
        container
        spacing={1}
        alignItems="center"
        className={classes.totals}
      >
        <Grid item xs={10}>
          <Typography align="right">Period total</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography align="right">{totalHoursForPeriod}</Typography>
        </Grid>
      </Grid>
    </>
  );
}
