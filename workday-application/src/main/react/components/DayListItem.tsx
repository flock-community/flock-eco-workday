import CreateIcon from '@mui/icons-material/Create';
import { IconButton, TableCell, TableRow } from '@mui/material';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import type { Dayjs } from 'dayjs';
// types
import type { DayProps } from '../types';
import { StatusMenu } from './status/StatusMenu';

function countWeekdays(from: Dayjs, to: Dayjs): number {
  let count = 0;
  let cursor = from.startOf('day');
  const end = to.startOf('day');
  while (!cursor.isAfter(end)) {
    const day = cursor.day();
    if (day !== 0 && day !== 6) count++;
    cursor = cursor.add(1, 'day');
  }
  return count;
}

type DayListItemProps = {
  value: DayProps;
  onClick: () => void;
  onClickStatus: (status: string) => void;
  hasAuthority: string;
  showType?: boolean;
};

export function DayListItem({
  value,
  onClick,
  onClickStatus,
  hasAuthority,
  showType,
}: DayListItemProps) {
  return (
    <TableRow>
      <TableCell>{value.description ? value.description : 'empty'}</TableCell>
      {showType && <TableCell>{value.type}</TableCell>}
      <TableCell>{value.from.format('DD-MM-YYYY')}</TableCell>
      <TableCell>{value.to.format('DD-MM-YYYY')}</TableCell>
      <TableCell align="right">{countWeekdays(value.from, value.to)}</TableCell>
      <TableCell align="right">{value.hours}</TableCell>
      <TableCell>
        <StatusMenu
          onChange={onClickStatus}
          disabled={!UserAuthorityUtil.hasAuthority(hasAuthority)}
          value={value.status}
        />
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={onClick} size="large">
          <CreateIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
