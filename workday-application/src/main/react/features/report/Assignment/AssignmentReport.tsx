import React, { useState } from "react";
import AssignmentReportTable from "./AssignmentReportTable";
import { Card, CardContent, CardHeader, Grid2 } from "@mui/material";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DMY_DATE } from "../../../clients/util/DateFormats";

// TODO CHECK ME and the differences.. Something seems off with defined ranges

export default function AssignmentReport() {
  const [from, setFrom] = useState(dayjs().startOf("month"));
  const [to, setTo] = useState(dayjs().endOf("month"));

  const renderDateRange = () => (
    <Grid2 container spacing={2}>
      <Grid2>
        <DatePicker
          label="From"
          value={from}
          format={DMY_DATE}
          onChange={(newValue) => newValue && setFrom(newValue)}
        />
      </Grid2>
      <Grid2>
        <DatePicker
          label="To"
          value={to}
          format={DMY_DATE}
          onChange={(newValue) => newValue && setTo(newValue)}
        />
      </Grid2>
    </Grid2>
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardHeader title="Assignment Report" />
          <CardContent>{renderDateRange()}</CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <AssignmentReportTable from={from} to={to} />
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
}
