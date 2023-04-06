import React from "react";
import { Box, Grid, TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { dateInPeriod, getDay, Period } from "../../features/period/Period";
import dayjs, { Dayjs } from "dayjs";
import weekOfYearPlugin from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYearPlugin);

const daysOfWeek = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const stringifyDate = (date) => {
  return date.format("YYYYMMDD");
};

const calcGrid = (period: Period) => {
  const diff =
    Math.ceil(
      period.to.startOf("week").diff(period.from.startOf("week"), "days") / 7
    ) + 1;
  const weeks = Array.from(Array(diff > 0 ? diff : 1).keys());
  return weeks.map((week) => {
    const day = period.from.startOf("week").add(week, "weeks").add(1, "day");

    const weekNumber = day.week();
    const year = day.year();
    const res = Array.from(Array(7).keys()).map((dayDiff) => {
      const date = day.add(dayDiff, "days");
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
  onChange: (day: Dayjs, hours: number) => void;
};

export function PeriodInput({ period, onChange }: PeriodInputProps) {
  const grid = calcGrid(period);

  const totalHoursForPeriod = period.days?.reduce(
    (previous, current) => previous + current
  );

  return (
    <>
      <Grid container spacing={1} alignItems="center">
        {/* The header of the table with the days as caption */}
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
      {/* End header */}

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

      {/* Bottom */}
      <Box mt={1}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={10}>
            <Typography align="right">Period total</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography align="right">{totalHoursForPeriod}</Typography>
          </Grid>
        </Grid>
      </Box>
      {/* Endbottom */}
    </>
  );
}
