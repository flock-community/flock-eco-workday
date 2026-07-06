import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
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
        <DataTable
          columns={[
            { header: 'Description' },
            { header: 'Type' },
            { header: 'From' },
            { header: 'To' },
            { header: 'Days', align: 'right' },
            { header: 'Hours', align: 'right' },
            { header: 'Status' },
            {},
          ]}
          items={list}
          renderRow={renderItem}
          emptyMessage="No leave days"
        />
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
