import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { type Client, ClientClient } from '../../clients/ClientClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { isDefined } from '../../utils/validation';

const CLIENT_PAGE_SIZE = 20;

type ClientListProps = {
  refresh?: boolean;
  onItemClick?: (item: Client) => void;
};

export function ClientList({ refresh, onItemClick }: ClientListProps) {
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
      <TableCard loading={loading}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    No clients
                  </TableCell>
                </TableRow>
              ) : (
                list.map((it) => (
                  <TableRow
                    key={`clients-${it.code}`}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={handleItem(it)}
                  >
                    <TableCell>{it.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={CLIENT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Box>
  );
}
