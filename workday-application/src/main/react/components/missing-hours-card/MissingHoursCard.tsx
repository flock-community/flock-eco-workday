import { Card, CardContent, CardHeader } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
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
    return (
      <ListItemButton key={index} onClick={() => openWorkDayDialog(item)}>
        <ListItemText
          primary={`You have missing hours in
                    ${new Date(item.monthYear).toLocaleString('en-EN', {
                      month: 'long',
                    })}`}
        />
      </ListItemButton>
    );
  }

  return (
    <>
      <Card variant={'outlined'} style={{ borderRadius: 0 }}>
        <CardHeader title={'Missing hours'} />
        {data.length === 0 && (
          <CardContent>
            <Typography display={'block'}>YEAH! You're up to date!</Typography>
          </CardContent>
        )}
        {data.length > 0 && (
          <CardContent>
            <List>{data.map((it, idx) => renderItem(it, idx))}</List>
          </CardContent>
        )}
      </Card>

      <MissingHoursDetailDialog
        open={missingHoursDetailsOpen}
        item={missingHoursDetailsItem}
        onComplete={handleCLoseWorkdayDialog}
      />
    </>
  );
}
