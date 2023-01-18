import React from "react";
import {Card, CardContent, Grid} from "@material-ui/core";
import AssignmentOverviewTable from "./AssignmentOverviewTable";

export default function AssignmentOverview() {
  return <Grid item xs={12}>
    <Card>
      <CardContent>
        <AssignmentOverviewTable/>
      </CardContent>
    </Card>
  </Grid>
}
