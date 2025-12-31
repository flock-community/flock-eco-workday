import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import {
  AggregationClient,
  ClientGrossRevenue,
} from "../../clients/AggregationClient";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@mui/material";
import TableRow from "@mui/material/TableRow";
import { currencyFormatter } from "../../utils/Currency";

const PREFIX = 'RevenuePerClientTable';

const classes = {
  table: `${PREFIX}-table`
};

const StyledTableContainer = styled(TableContainer)({
  [`& .${classes.table}`]: {
    maxWidth: 500,
  },
});

type RevenuePerClientChartProps = {
  year?: number;
};

export function RevenuePerClientTable({ year }: RevenuePerClientChartProps) {
  const [items, setItems] = useState<ClientGrossRevenue[]>();
  const [totalGrossRevenue, setTotalGrossRevenue] = useState<number>();



  useEffect(() => {
    const date = new Date();

    const validateResponse = (res: ClientGrossRevenue[] | null) => {
      if (!res) {
        throw Error("Could not fetch total gross revenue per client");
      }
      return res;
    };

    AggregationClient.totalPerClientByYear(year || date.getFullYear())
      .then((res) => validateResponse(res))
      .then((res) => setItems(res));
  }, [year]);

  useEffect(() => {
    if (!items) return;

    const totalGrossRevenue = items
      .map((item) => item.revenueGross)
      .reduce((previousValue, currentValue) => previousValue + currentValue);

    setTotalGrossRevenue(totalGrossRevenue);
  }, [items]);

  if (!items) return <AlignedLoader />;

  const renderItem = (item: ClientGrossRevenue, index: number) => (
    <TableRow key={index}>
      <TableCell>{item.name}</TableCell>
      <TableCell>{currencyFormatter.format(item.revenueGross)}</TableCell>
    </TableRow>
  );

  const totals = (
    <TableRow>
      <TableCell>Total</TableCell>
      <TableCell>
        {totalGrossRevenue
          ? currencyFormatter.format(totalGrossRevenue)
          : "..."}
      </TableCell>
    </TableRow>
  );

  return (
    <StyledTableContainer>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Gross revenue</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(renderItem)}
          {totals}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
}
