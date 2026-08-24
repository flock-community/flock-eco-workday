import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import { useEffect, useState } from 'react';
import { SICKDAY_PAGE_SIZE, SickDayClient } from '../../clients/SickDayClient';
import { DayListItem } from '../../components/DayListItem';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import type { DayListProps, DayProps } from '../../types';

export function SickDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
  onClickAdd,
}: Readonly<DayListProps>) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      SickDayClient.findAllByPersonId(personId, page).then(
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
        key={`sickday-list-item-${key}`}
        value={item}
        onClick={() => onClickRow(item)}
        onClickStatus={(status) => onClickStatus(status, item)}
        hasAuthority={'SickdayAuthority.ADMIN'}
      />
    );
  }

  return (
    <>
      <TableCard
        title="Sick days"
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
            { header: 'From' },
            { header: 'To' },
            { header: 'Days', align: 'right' },
            { header: 'Hours', align: 'right' },
            { header: 'Status' },
            {},
          ]}
          items={list}
          renderRow={renderItem}
          emptyMessage="No sick days"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={SICKDAY_PAGE_SIZE}
        changePageCb={setPage}
      />
    </>
  );
}
