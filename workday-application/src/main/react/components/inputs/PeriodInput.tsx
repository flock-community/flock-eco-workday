import React from "react";
import { Box, Grid2, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
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
    (previous, current) => previous + current,
    0
  );

  return (
    <>
      <Grid2 container spacing={2} alignItems="center">
        {/* The header of the table with the days as caption */}
        <Grid2 size={{ xs: 2 }}>
          <Typography>Week</Typography>
        </Grid2>
        {daysOfWeek.map((d) => (
          <Grid2 size="grow" textAlign="center" key={`day-name-${d}`}>
            <Typography>{d}</Typography>
          </Grid2>
        ))}
        <Grid2 size={{ xs: 2 }}>
          <Typography align="right">Total</Typography>
        </Grid2>
      </Grid2>
      {/* End header */}

      {grid.map((week) => {
        return (
          <Grid2
            container
            spacing={1}
            mt={1}
            mb={1}
            key={`${week.year} week-${week.weekNumber}`}
            alignItems="center"
            alignContent="center"
          >
            <Grid2 size={{ xs: 2 }}>
              <Typography>{week.weekNumber}</Typography>
            </Grid2>
            {week.days?.map((day) => (
              <Grid2 size="grow" key={`day-${day.key}`}>
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
              </Grid2>
            ))}
            <Grid2 size={{ xs: 2 }}>
              <Typography align="right">{week.total}</Typography>
            </Grid2>
          </Grid2>
        );
      })}

      {/* Bottom */}
      <Box mt={2}>
        <Grid2 container spacing={1} alignItems="center">
          <Grid2 size={{ xs: 10 }}>
            <Typography align="right">Period total</Typography>
          </Grid2>
          <Grid2 size={{ xs: 2 }}>
            <Typography align="right">{totalHoursForPeriod}</Typography>
          </Grid2>
        </Grid2>
      </Box>
      {/* Endbottom */}
    </>
  );
}
