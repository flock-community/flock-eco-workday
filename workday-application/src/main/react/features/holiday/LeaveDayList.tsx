import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  LEAVE_DAY_PAGE_SIZE,
  LeaveDayClient,
} from '../../clients/LeaveDayClient';
import { DayListItem } from '../../components/DayListItem';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import type { DayListProps, DayProps } from '../../types';

export function LeaveDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
  onClickAdd,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      LeaveDayClient.findAllByPersonId(personId, page).then(
        ({ list, count }: { list: DayProps[]; count: number }) => {
          setList(list);
          setCount(count);
          setLoading(false);
        },
      );
    } else {
      setList([]);
    }
  }, [refresh, personId, page]);

  function renderItem(item: DayProps, key: number) {
    return (
      <DayListItem
        key={`holiday-list-item-${key}`}
        value={item}
        onClick={() => onClickRow(item)}
        onClickStatus={(status) => onClickStatus(status, item)}
        hasAuthority={'LeaveDayAuthority.ADMIN'}
        showType
      />
    );
  }

  return (
    <>
      <TableCard
        title="Leave days"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Days</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    No leave days
                  </TableCell>
                </TableRow>
              ) : (
                list.map(renderItem)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={LEAVE_DAY_PAGE_SIZE}
        changePageCb={setPage}
      />
    </>
  );
}
