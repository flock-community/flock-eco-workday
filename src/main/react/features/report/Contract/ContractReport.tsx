import React from "react";
import {Card, CardContent, Grid} from "@material-ui/core";
import ContractReportTable from "./ContractReportTable";

export default function ContractReport() {
  return <Grid item xs={12}>
    <Card>
      <CardContent>
        <ContractReportTable />
      </CardContent>
    </Card>
  </Grid>

}
