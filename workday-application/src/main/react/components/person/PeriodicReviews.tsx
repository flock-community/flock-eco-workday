import {
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
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
import { useState } from 'react';
import type { PeriodicReviewDue } from '../../clients/PeriodicReviewClient';
import { PlanPeriodicReviewDialog } from './PlanPeriodicReviewDialog';

type PeriodicReviewsProps = {
  withinNWeeks: number;
  periodicReviews?: PeriodicReviewDue[];
  // Lists every active internal engineer instead of only the reviews due within the window.
  showAll: boolean;
  onShowAllChange: (showAll: boolean) => void;
  // Makes the rows open a dialog to plan the next review; leave out when the user cannot create events.
  onPlanned?: () => void;
};

export default function PeriodicReviews({
  withinNWeeks,
  periodicReviews,
  showAll,
  onShowAllChange,
  onPlanned,
}: PeriodicReviewsProps) {
  const [planning, setPlanning] = useState<PeriodicReviewDue>();

  const handlePlanned = () => {
    setPlanning(undefined);
    onPlanned?.();
  };

  const noContent = (
    <Typography color="text.secondary">
      {showAll
        ? 'No active internal engineers'
        : `No periodic reviews to plan within ${withinNWeeks} weeks`}
    </Typography>
  );

  const renderLastReview = (item: PeriodicReviewDue) => {
    if (!item.lastReview) return 'Never';
    const date = item.lastReview.format('DD-MM-YYYY');
    return item.lastReview.isAfter(dayjs(), 'day') ? `${date} (planned)` : date;
  };

  const renderDue = (item: PeriodicReviewDue) => {
    if (!item.dueDate) return '-';
    const date = item.dueDate.format('DD-MM-YYYY');
    return item.dueDate.isBefore(dayjs(), 'day') ? `${date} (overdue)` : date;
  };

  const renderItem = (item: PeriodicReviewDue) => (
    <TableRow
      hover={!!onPlanned}
      key={item.personUuid}
      onClick={onPlanned && (() => setPlanning(item))}
      sx={onPlanned && { cursor: 'pointer' }}
    >
      <TableCell>{item.personName}</TableCell>
      <TableCell>{renderLastReview(item)}</TableCell>
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
      <CardHeader
        title={showAll ? 'Periodic reviews' : 'Periodic reviews to plan'}
        action={
          <FormControlLabel
            control={
              <Switch
                checked={showAll}
                onChange={(event) => onShowAllChange(event.target.checked)}
              />
            }
            label="All internal engineers"
          />
        }
      />
      <CardContent>
        {periodicReviews === undefined ? (
          <AlignedLoader />
        ) : periodicReviews.length > 0 ? (
          table
        ) : (
          noContent
        )}
      </CardContent>
      {onPlanned && (
        <PlanPeriodicReviewDialog
          item={planning}
          onClose={() => setPlanning(undefined)}
          onPlanned={handlePlanned}
        />
      )}
    </Card>
  );
}
