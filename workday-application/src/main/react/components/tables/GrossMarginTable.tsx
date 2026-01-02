import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import { AggregationClient } from '../../clients/AggregationClient';

type GrossMarginTableProps = {
  year?: number;
};

export function GrossMarginTable({ year }: GrossMarginTableProps) {
  const [state, setState] = useState<any>();

  useEffect(() => {
    const date = new Date();
    AggregationClient.totalPerPersonByYear(year || date.getFullYear()).then(
      (res) => setState(res),
    );
  }, [year]);

  if (!state) return <AlignedLoader />;

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
          .filter((it) => it.revenue?.total)
          .filter((it) => it.contractTypes.includes('ContractInternal'))
          .map((it) => (
            <TableRow key={`row-${it.id}`}>
              <TableCell>{it.name}</TableCell>
              <TableCell>{it.revenue.total.toFixed(2)}</TableCell>
              <TableCell>{it.cost.toFixed(2)}</TableCell>
              <TableCell>{(it.revenue.total - it.cost).toFixed(2)}</TableCell>
              <TableCell>
                {(
                  ((it.revenue.total - it.cost) / it.revenue.total) *
                  100
                ).toFixed(1)}{' '}
                %
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
