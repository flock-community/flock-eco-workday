import React from "react";
import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import ContractOverviewTable from "./ContractOverviewTable";

export default function ContractOverview() {
  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader title="Contracts" />
        <CardContent>
          <ContractOverviewTable />
        </CardContent>
      </Card>
    </Grid>
  );
}
