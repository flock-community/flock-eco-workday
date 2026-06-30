import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import { MissingHoursDetailDialog } from './MissingHoursDetailDialog';

type MissingHoursCardProps = {
  totalPerPersonMe: any;
};
export type AggregationPersonObject = {
  monthYear: string;
  missing: number;
  id: string;
  name: string;
  contractTypes: string[];
  sickDays: number;
  workDays: number;
  assignment: number;
  event: number;
  total: number;
  leaveDayUsed: number;
  leaveDayBalance: number;
  paidParentalLeaveUsed: number;
  unpaidParentalLeaveUsed: number;
  revenue: {};
  cost: number;
};

const toAggregationPersonObject = (item: any): AggregationPersonObject => {
  return { ...item } as AggregationPersonObject;
};

export function MissingHoursCard({ totalPerPersonMe }: MissingHoursCardProps) {
  const [data, setData] = useState<AggregationPersonObject[]>([]);
  const [missingHoursDetailsOpen, setMissingHoursDetailsOpen] =
    useState<boolean>(false);
  const [missingHoursDetailsItem, setMissingHoursDetailsItem] =
    useState<AggregationPersonObject>();

  useEffect(() => {
    if (totalPerPersonMe) {
      const data: AggregationPersonObject[] = Object.keys(totalPerPersonMe)
        .map((monthYear) => ({ ...totalPerPersonMe[monthYear], monthYear }))
        .filter((it) => it !== null)
        .filter((it) => it.assignment > 0)
        .map((it) => ({
          ...it,
          missing: Math.max(
            0,
            it.total -
              (it.workDays +
                it.leaveDayUsed +
                it.paidLeaveHours +
                it.sickDays +
                it.event +
                it.paidParentalLeaveUsed +
                it.unpaidParentalLeaveUsed),
          ),
        }))
        .filter((it) => it.missing > 0)
        .map((it) => toAggregationPersonObject(it));
      setData(data);
    }
  }, [totalPerPersonMe, toAggregationPersonObject]);

  if (!totalPerPersonMe) return <AlignedLoader />;

  const openWorkDayDialog = (item: AggregationPersonObject) => {
    setMissingHoursDetailsOpen(true);
    setMissingHoursDetailsItem(item);
  };

  const handleCLoseWorkdayDialog = () => {
    setMissingHoursDetailsOpen(false);
    setMissingHoursDetailsItem(undefined);
  };

  function renderItem(item: AggregationPersonObject, index: number) {
    const monthLabel = new Date(item.monthYear).toLocaleString('en-EN', {
      month: 'long',
      year: 'numeric',
    });
    const hours = Math.round(item.missing);
    return (
      <TableRow
        hover
        key={index}
        onClick={() => openWorkDayDialog(item)}
        sx={{ cursor: 'pointer' }}
        data-testid={'table-row-missing-hours'}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleRoundedIcon fontSize="small" color="action" />
            <span>{monthLabel}</span>
          </Box>
        </TableCell>
        <TableCell width={110} align={'right'}>
          {hours} h
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Card variant={'outlined'} style={{ borderRadius: 0 }}>
      <CardHeader title={'Missing hours'} />
      {data.length === 0 && (
        <CardContent>
          <Typography display={'block'}>YEAH! You're up to date!</Typography>
        </CardContent>
      )}
      {data.length > 0 && (
        <CardContent>
          <Table size={'small'}>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align={'right'}>Missing</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((it, idx) => renderItem(it, idx))}
            </TableBody>
          </Table>
        </CardContent>
      )}
      <MissingHoursDetailDialog
        open={missingHoursDetailsOpen}
        item={missingHoursDetailsItem}
        onComplete={handleCLoseWorkdayDialog}
      />
    </Card>
  );
}
