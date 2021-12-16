import React, {useEffect, useState} from "react";
import {AlignedLoader} from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import {AggregationClient} from "../../clients/AggregationClient";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";

type GrossMarginTableProps = {
  year?: number;
};

export function GrossMarginTable({year}: GrossMarginTableProps) {

  const [state, setState] = useState<any>();

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerPersonByYear(
      year || date.getFullYear()
    ).then((res) => setState(res));
  }, [year]);

  if (!state) return <AlignedLoader/>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Revenue</TableCell>
          <TableCell>Cost</TableCell>
          <TableCell>Margin</TableCell>
          <TableCell>Percentage</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {state
          .filter(it => it.revenue && it.revenue.total)
          .map(it => (<TableRow key={`row-${it.id}`}>
            <TableCell>{it.name}</TableCell>
            <TableCell>{it.revenue.total}</TableCell>
            <TableCell>{it.cost}</TableCell>
            <TableCell>{it.revenue.total - it.cost}</TableCell>
            <TableCell>{((it.revenue.total - it.cost) / it.revenue.total * 100).toFixed(1)} %</TableCell>
          </TableRow>))}
      </TableBody>
    </Table>
  );
}
