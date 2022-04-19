import React, { useState } from "react";
import AssignmentReportTable from "./AssignmentReportTable";
import moment from "moment";
import { Box, Card, CardContent, CardHeader, Grid } from "@material-ui/core";
import {
  DateRange,
  DateRangePicker,
  DefinedRange,
} from "materialui-daterange-picker";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

export default function AssignmentReport() {
  const [from, setFrom] = useState(moment().startOf("month"));
  const [to, setTo] = useState(moment().endOf("month"));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleRangeChange = (dateRange: DateRange) => {
    setFrom(moment(dateRange.startDate));
    setTo(moment(dateRange.endDate));
    setDatePickerOpen(false);
  };

  const definedRanges: DefinedRange[] = [
    {
      label: "2 weeks ago",
      startDate: moment().subtract(2, "weeks").startOf("week").toDate(),
      endDate: moment().subtract(2, "weeks").endOf("week").toDate(),
    },
    {
      label: "1 week ago",
      startDate: moment().subtract(1, "weeks").startOf("week").toDate(),
      endDate: moment().subtract(1, "weeks").endOf("week").toDate(),
    },
    {
      label: "Current week",
      startDate: moment().startOf("week").toDate(),
      endDate: moment().endOf("week").toDate(),
    },
    {
      label: "2 months ago",
      startDate: moment().subtract(2, "months").startOf("month").toDate(),
      endDate: moment().subtract(2, "months").endOf("month").toDate(),
    },
    {
      label: "1 month ago",
      startDate: moment().subtract(1, "months").startOf("month").toDate(),
      endDate: moment().subtract(1, "months").endOf("month").toDate(),
    },
    {
      label: "Current month",
      startDate: moment().startOf("month").toDate(),
      endDate: moment().endOf("month").toDate(),
    },
  ];

  const renderDatePicker = () => (
    <DateRangePicker
      initialDateRange={{
        startDate: from.toDate(),
        endDate: to.toDate(),
      }}
      open={datePickerOpen}
      toggle={() => {
        setDatePickerOpen(!datePickerOpen);
      }}
      onChange={handleRangeChange}
      definedRanges={definedRanges}
    />
  );

  const renderDateRange = () => (
    <>
      <Typography variant="caption">
        Showing data from {from.format("DD-MM-YYYY")} to{" "}
        {to.format("DD-MM-YYYY")}
      </Typography>
      <Box mt={3}>
        <Button onClick={() => setDatePickerOpen(true)}>
          Change date range
        </Button>
      </Box>
    </>
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Assignment Report" />
          <CardContent>
            {datePickerOpen ? renderDatePicker() : renderDateRange()}
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
