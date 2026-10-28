import {
  Card,
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import dayjs from 'dayjs';
import type { PeriodicReviewDue } from '../../clients/PeriodicReviewClient';

type PeriodicReviewsProps = {
  withinNWeeks: number;
  periodicReviews?: PeriodicReviewDue[];
};

export default function PeriodicReviews({
  withinNWeeks,
  periodicReviews,
}: PeriodicReviewsProps) {
  const noContent = (
    <Typography color="text.secondary">
      No periodic reviews to plan within {withinNWeeks} weeks
    </Typography>
  );

  const renderDue = (item: PeriodicReviewDue) => {
    if (item.dueDate === null) return 'Now';
    const date = item.dueDate.format('DD-MM-YYYY');
    return item.dueDate.isBefore(dayjs(), 'day') ? `${date} (overdue)` : date;
  };

  const renderItem = (item: PeriodicReviewDue) => (
    <TableRow key={item.person.uuid}>
      <TableCell>{item.person.fullName}</TableCell>
      <TableCell>
        {item.lastReview ? item.lastReview.format('DD-MM-YYYY') : 'None yet'}
      </TableCell>
      <TableCell>{renderDue(item)}</TableCell>
    </TableRow>
  );

  const table = (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Last review</TableCell>
            <TableCell>Due</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{periodicReviews?.map(renderItem)}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: '14px' }}>
      <CardHeader title="Periodic reviews to plan" />
      <CardContent>
        {periodicReviews === undefined ? (
          <AlignedLoader />
        ) : periodicReviews.length > 0 ? (
          table
        ) : (
          noContent
        )}
      </CardContent>
    </Card>
  );
}
