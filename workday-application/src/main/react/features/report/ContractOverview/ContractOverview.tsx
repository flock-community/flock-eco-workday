import React from "react";
import { Card, CardContent, CardHeader, Grid2 } from "@mui/material";
import ContractOverviewTable from "./ContractOverviewTable";

export default function ContractOverview() {
  return (
    <Grid2 size={{ xs: 12 }}>
      <Card>
        <CardHeader title="Contracts" />
        <CardContent>
          <ContractOverviewTable />
        </CardContent>
      </Card>
    </Grid2>
  );
}
