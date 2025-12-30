import React from "react";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import AssignmentOverviewTable from "./AssignmentOverviewTable";

export default function AssignmentOverview() {
  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader title="Assignments" />
        <CardContent>
          <AssignmentOverviewTable />
        </CardContent>
      </Card>
    </Grid>
  );
}
