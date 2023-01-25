import React from "react";
import {Card, CardContent, CardHeader, Grid} from "@material-ui/core";
import ContractReportTable from "./ContractReportTable";

export default function ContractReport() {
  return (
    <Grid item xs={12}>
    <Card>
      <CardHeader
        title="Contracts"
      />
      <CardContent>
        <ContractReportTable />
      </CardContent>
    </Card>
  </Grid>
  )
}
