import AddIcon from '@mui/icons-material/Add';
import { Box, Button, TableCell, TableRow } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import { useEffect, useState } from 'react';
import {
  CONTRACT_PAGE_SIZE,
  ContractClient,
} from '../../clients/ContractClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { ContractType } from './ContractType';

const formatDate = (date) => (date ? date.format('DD-MM-YYYY') : <em>now</em>);

function compensation(it): string {
  switch (it.type) {
    case ContractType.EXTERNAL:
      return `€ ${it.hourlyRate} /h`;
    case ContractType.INTERNAL:
      return `€ ${it.monthlySalary} /mo`;
    case ContractType.MANAGEMENT:
      return `€ ${it.monthlyFee} /mo`;
    case ContractType.SERVICE:
      return `€ ${it.monthlyCost} /mo`;
    default:
      return '-';
  }
}

const hasHoursPerWeek = (type) =>
  type === ContractType.EXTERNAL || type === ContractType.INTERNAL;

type ContractListProps = {
  refresh: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
  onClickAdd?: () => void;
};
export function ContractList({
  refresh,
  personId,
  onItemClick,
  onClickAdd,
}: Readonly<ContractListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      ContractClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setCount(res.count);
        setLoading(false);
      });
    }
  }, [refresh, personId, page]);

  const handleClickItem = (it) => () => {
    if (onItemClick) onItemClick(it);
  };

  return (
    <Box>
      <TableCard
        title="Contracts"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <DataTable
          columns={[
            { header: 'Type' },
            { header: 'From' },
            { header: 'To' },
            { header: 'Hours/week', align: 'right' },
            { header: 'Compensation', align: 'right' },
          ]}
          items={items}
          renderRow={(it) => (
            <TableRow
              key={it.code}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={handleClickItem(it)}
            >
              <TableCell>{it.type}</TableCell>
              <TableCell>{formatDate(it.from)}</TableCell>
              <TableCell>{formatDate(it.to)}</TableCell>
              <TableCell align="right">
                {hasHoursPerWeek(it.type) ? it.hoursPerWeek : '-'}
              </TableCell>
              <TableCell align="right">{compensation(it)}</TableCell>
            </TableRow>
          )}
          emptyMessage="No contracts"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={CONTRACT_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
