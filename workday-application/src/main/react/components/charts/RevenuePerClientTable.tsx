import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import {
  AggregationClient,
  type ClientGrossRevenue,
} from '../../clients/AggregationClient';
import { currencyFormatter } from '../../utils/Currency';

const PREFIX = 'RevenuePerClientTable';

const classes = {
  table: `${PREFIX}Table`,
};

const StyledTableContainer = styled(TableContainer)({
  [`& .${classes.table}`]: {
    maxWidth: 800,
  },
});

const percentageFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

type RevenuePerClientChartProps = {
  year?: number;
};

export function RevenuePerClientTable({ year }: RevenuePerClientChartProps) {
  const [items, setItems] = useState<ClientGrossRevenue[]>();

  useEffect(() => {
    const date = new Date();

    const validateResponse = (res: ClientGrossRevenue[] | null) => {
      if (!res) {
        throw Error('Could not fetch total gross revenue per client');
      }
      return res;
    };

    AggregationClient.totalPerClientByYear(year || date.getFullYear())
      .then((res) => validateResponse(res))
      .then((res) => setItems(res.filter((item) => item.revenueGross > 0)));
  }, [year]);

  if (!items) return <AlignedLoader />;

  const totalRevenue = items.reduce((acc, item) => acc + item.revenueGross, 0);
  const totalCost = items.reduce((acc, item) => acc + item.cost, 0);

  const renderRow = (name: string, revenue: number, cost: number) => {
    const margin = revenue - cost;
    return (
      <>
        <TableCell>{name}</TableCell>
        <TableCell align="right">{currencyFormatter.format(revenue)}</TableCell>
        <TableCell align="right">{currencyFormatter.format(cost)}</TableCell>
        <TableCell align="right">{currencyFormatter.format(margin)}</TableCell>
        <TableCell align="right">
          {revenue > 0 ? percentageFormatter.format(margin / revenue) : '–'}
        </TableCell>
      </>
    );
  };

  return (
    <StyledTableContainer>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="right">Revenue</TableCell>
            <TableCell align="right">Cost</TableCell>
            <TableCell align="right">Margin</TableCell>
            <TableCell align="right">Margin %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.name}>
              {renderRow(item.name, item.revenueGross, item.cost)}
            </TableRow>
          ))}
          <TableRow>{renderRow('Total', totalRevenue, totalCost)}</TableRow>
        </TableBody>
      </Table>
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mt: 2, maxWidth: 800 }}
      >
        Based on registered hours. Revenue is hours × the assignment rate. Cost
        is hours × the person's cost per hour: the external hourly rate, or the
        salary or management fee spread over the contract hours. Leave, sickness
        and time without an assignment are not charged to a client.
      </Typography>
    </StyledTableContainer>
  );
}
