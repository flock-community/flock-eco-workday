import React, { useEffect, useState } from "react";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import {
  AggregationClient,
  ClientGrossRevenue,
} from "../../clients/AggregationClient";
import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";
import { currencyFormatter } from "../../utils/Currency";

const useStyles = makeStyles({
  table: {
    maxWidth: 500,
  },
});

type RevenuePerClientChartProps = {
  year?: number;
};

export function RevenuePerClientTable({ year }: RevenuePerClientChartProps) {
  const [items, setItems] = useState<ClientGrossRevenue[]>();
  const [totalGrossRevenue, setTotalGrossRevenue] = useState<number>();

  const classes = useStyles();

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
    <TableContainer>
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
    </TableContainer>
  );
}
