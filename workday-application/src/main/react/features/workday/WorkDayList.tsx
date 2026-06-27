import {
  Box,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { WORK_DAY_PAGE_SIZE, WorkDayClient } from '../../clients/WorkDayClient';
// Components
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
// Types
import type { DayListProps, DayProps } from '../../types';
import { WorkDayListItem } from './WorkDayListItem';

export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);
    WorkDayClient.findAllByPersonUuid(personId, page).then(
      (res: { list: DayProps[]; count: number }) => {
        setList(res.list);
        setCount(res.count);
        setLoading(false);
      },
    );
  }, [refresh, personId, page]);

  function renderItem(item) {
    return (
      <WorkDayListItem
        key={item.id}
        value={item}
        onClick={() => onClickRow(item)}
        onClickStatus={(status) => onClickStatus(status, item)}
        hasAuthority={'WorkDayAuthority.ADMIN'}
      />
    );
  }

  const renderItems = () => {
    if (list.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={8}
            align="center"
            sx={{ py: 4, color: 'text.secondary' }}
          >
            No workdays
          </TableCell>
        </TableRow>
      );
    }

    return list.map(renderItem);
  };

  return (
    <Box>
      <TableCard loading={loading}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Assignment</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Days</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>{renderItems()}</TableBody>
          </Table>
        </TableContainer>
      </TableCard>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={WORK_DAY_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Box>
  );
}
