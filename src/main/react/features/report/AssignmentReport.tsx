import React, { ChangeEvent, useEffect, useState } from "react";
import AssignmentReportTable from "./AssignmentReportTable";
import moment from "moment";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  MenuItem,
  Select,
} from "@material-ui/core";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import MomentUtils from "@date-io/moment";
import Typography from "@material-ui/core/Typography";

type Range = "week" | "month";

export default function AssignmentReport() {
  const [range, setRange] = useState<Range>("week");
  const [date, setDate] = useState<moment.Moment>(moment());
  const [from, setFrom] = useState(moment().startOf(range));
  const [to, setTo] = useState(moment().endOf(range));

  const handleDateChange = (selectedDate: MaterialUiPickersDate) => {
    if (selectedDate != null) {
      setDate(selectedDate);
    }
  };

  useEffect(() => {
    setFrom(date.clone().startOf(range));
    setTo(date.clone().endOf(range));
  }, [range, date]);

  const handleRangeChange = (event: ChangeEvent<{ value: unknown }>) =>
    setRange(event.target.value as Range);

  const renderDatePickerLabel = (
    date: MaterialUiPickersDate,
    invalidLabel?: string
  ) => invalidLabel ?? date!!.clone().format("DD-MM");

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Assignment Report" />
          <CardContent>
            <Select value={range} onChange={handleRangeChange}>
              <MenuItem value="week">Week of</MenuItem>
              <MenuItem value="month">Month of</MenuItem>
            </Select>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker
                value={date}
                onChange={handleDateChange}
                labelFunc={renderDatePickerLabel}
              />
            </MuiPickersUtilsProvider>
            <Box mt={1}>
              <Typography>
                Showing data for the week from {from.format("DD-MM-YYYY")} to{" "}
                {to.format("DD-MM-YYYY")}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <AssignmentReportTable from={from} to={to} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
