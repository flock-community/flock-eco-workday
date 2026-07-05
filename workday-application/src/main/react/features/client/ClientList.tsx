import AddIcon from '@mui/icons-material/Add';
import { Box, Button, TableCell, TableRow } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import { useEffect, useState } from 'react';
import { type Client, ClientClient } from '../../clients/ClientClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { isDefined } from '../../utils/validation';

const CLIENT_PAGE_SIZE = 15;

type ClientListProps = {
  refresh?: boolean;
  onItemClick?: (item: Client) => void;
  onClickAdd?: () => void;
};

export function ClientList({
  refresh,
  onItemClick,
  onClickAdd,
}: ClientListProps) {
  const [list, setList] = useState<Client[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);
    ClientClient.findAllByPage({
      page,
      size: CLIENT_PAGE_SIZE,
      sort: 'name,asc',
    }).then((res) => {
      setList(res.list);
      setCount(res.count);
      setLoading(false);
    });
  }, [refresh, page]);

  const handleItem = (it: Client) => () => {
    if (isDefined(onItemClick)) onItemClick(it);
  };

  return (
    <Box>
      <TableCard
        title="Clients"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <DataTable
          columns={[{ header: 'Name' }]}
          items={list}
          renderRow={(it) => (
            <TableRow
              key={`clients-${it.code}`}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={handleItem(it)}
            >
              <TableCell>{it.name}</TableCell>
            </TableRow>
          )}
          emptyMessage="No clients"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={CLIENT_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
