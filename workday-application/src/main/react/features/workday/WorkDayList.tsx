import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import { useEffect, useState } from 'react';
import { WORK_DAY_PAGE_SIZE, WorkDayClient } from '../../clients/WorkDayClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import type { DayListProps, DayProps } from '../../types';
import { WorkDayListItem } from './WorkDayListItem';

export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
  onClickAdd,
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

  return (
    <Box>
      <TableCard
        title="Work days"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <DataTable
          columns={[
            { header: 'Client' },
            { header: 'Assignment' },
            { header: 'From' },
            { header: 'To' },
            { header: 'Days', align: 'right' },
            { header: 'Hours', align: 'right' },
            { header: 'Status' },
            {},
          ]}
          items={list}
          renderRow={renderItem}
          emptyMessage="No workdays"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={WORK_DAY_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
