import { Card, CardContent, CardHeader } from '@mui/material';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import { TooManyHoursDetailDialog } from './TooManyHoursDetailDialog';

type TooManyHoursCardProps = {
  totalPerPersonMe: any;
};

export type TooManyHoursPersonObject = {
  monthYear: string;
  extra: number;
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

const toTooManyHoursPersonObject = (item: any): TooManyHoursPersonObject => {
  return { ...item } as TooManyHoursPersonObject;
};

export function TooManyHoursCard({ totalPerPersonMe }: TooManyHoursCardProps) {
  const [data, setData] = useState<TooManyHoursPersonObject[]>([]);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [detailsItem, setDetailsItem] = useState<TooManyHoursPersonObject>();

  useEffect(() => {
    if (totalPerPersonMe) {
      const data: TooManyHoursPersonObject[] = Object.keys(totalPerPersonMe)
        .map((monthYear) => ({ ...totalPerPersonMe[monthYear], monthYear }))
        .filter((it) => it !== null)
        .filter((it) => it.assignment > 0)
        .map((it) => ({
          ...it,
          extra: Math.max(
            0,
            it.workDays +
              it.leaveDayUsed +
              it.sickDays +
              it.event +
              it.paidParentalLeaveUsed +
              it.unpaidParentalLeaveUsed -
              it.total,
          ),
        }))
        .filter((it) => it.extra > 0)
        .map((it) => toTooManyHoursPersonObject(it));
      setData(data);
    }
  }, [totalPerPersonMe]);

  if (!totalPerPersonMe) return <AlignedLoader />;

  const openDetailsDialog = (item: TooManyHoursPersonObject) => {
    setDetailsOpen(true);
    setDetailsItem(item);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsOpen(false);
    setDetailsItem(undefined);
  };

  function renderItem(item: TooManyHoursPersonObject, index: number) {
    return (
      <ListItemButton key={index} onClick={() => openDetailsDialog(item)}>
        <ListItemText
          primary={`You have registered too many hours in
                    ${new Date(item.monthYear).toLocaleString('en-EN', {
                      month: 'long',
                    })}`}
          secondary={`${item.extra} hours over the expected total`}
        />
      </ListItemButton>
    );
  }

  return (
    <Card variant={'outlined'} style={{ borderRadius: 0 }}>
      <CardHeader title={'Too many hours'} />
      {data.length === 0 && (
        <CardContent>
          <Typography display={'block'}>
            No months with too many hours.
          </Typography>
        </CardContent>
      )}
      {data.length > 0 && (
        <CardContent>
          <List>{data.map((it, idx) => renderItem(it, idx))}</List>
        </CardContent>
      )}
      <TooManyHoursDetailDialog
        open={detailsOpen}
        item={detailsItem}
        onComplete={handleCloseDetailsDialog}
      />
    </Card>
  );
}
