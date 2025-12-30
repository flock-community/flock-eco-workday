import React, { useState } from "react";
import AssignmentReportTable from "./AssignmentReportTable";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DMY_DATE } from "../../../clients/util/DateFormats";

// TODO CHECK ME and the differences.. Something seems off with defined ranges

export default function AssignmentReport() {
  const [from, setFrom] = useState(dayjs().startOf("month"));
  const [to, setTo] = useState(dayjs().endOf("month"));

  const renderDateRange = () => (
    <Grid container spacing={2}>
      <Grid item>
        <DatePicker
          label="From"
          value={from}
          format={DMY_DATE}
          onChange={(newValue) => newValue && setFrom(newValue)}
        />
      </Grid>
      <Grid item>
        <DatePicker
          label="To"
          value={to}
          format={DMY_DATE}
          onChange={(newValue) => newValue && setTo(newValue)}
        />
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Assignment Report" />
          <CardContent>{renderDateRange()}</CardContent>
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
