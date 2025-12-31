import React from "react";
import { Card, CardContent, CardHeader, Grid2 } from "@mui/material";
import AssignmentOverviewTable from "./AssignmentOverviewTable";

export default function AssignmentOverview() {
  return (
    <Grid2 size={{ xs: 12 }}>
      <Card>
        <CardHeader title="Assignments" />
        <CardContent>
          <AssignmentOverviewTable />
        </CardContent>
      </Card>
    </Grid2>
  );
}
