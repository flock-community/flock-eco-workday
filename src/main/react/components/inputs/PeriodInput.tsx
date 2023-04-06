import React from "react";
import { Box, Grid, TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { Period } from "../../features/period/Period";
import dayjs, { Dayjs } from "dayjs";
import weekOfYearPlugin from "dayjs/plugin/weekOfYear";

// utils
import { calcGrid } from "../../utils/calcGrid";

dayjs.extend(weekOfYearPlugin);

const daysOfWeek = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

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
