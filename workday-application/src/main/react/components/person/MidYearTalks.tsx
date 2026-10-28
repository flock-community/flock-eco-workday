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
import type { MidYearTalkDue } from '../../clients/MidYearTalkClient';

type MidYearTalksProps = {
  withinNWeeks: number;
  midYearTalks?: MidYearTalkDue[];
};

export default function MidYearTalks({
  withinNWeeks,
  midYearTalks,
}: MidYearTalksProps) {
  const noContent = (
    <Typography color="text.secondary">
      No mid-year talks to plan within {withinNWeeks} weeks
    </Typography>
  );

  const renderDue = (item: MidYearTalkDue) => {
    if (item.dueDate === null) return 'Now';
    const date = item.dueDate.format('DD-MM-YYYY');
    return item.dueDate.isBefore(dayjs(), 'day') ? `${date} (overdue)` : date;
  };

  const renderItem = (item: MidYearTalkDue) => (
    <TableRow key={item.person.uuid}>
      <TableCell>{item.person.fullName}</TableCell>
      <TableCell>
        {item.lastTalk ? item.lastTalk.format('DD-MM-YYYY') : 'None yet'}
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
            <TableCell>Last talk</TableCell>
            <TableCell>Due</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{midYearTalks?.map(renderItem)}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: '14px' }}>
      <CardHeader title="Mid-year talks to plan" />
      <CardContent>
        {midYearTalks === undefined ? (
          <AlignedLoader />
        ) : midYearTalks.length > 0 ? (
          table
        ) : (
          noContent
        )}
      </CardContent>
    </Card>
  );
}
