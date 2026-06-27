import { Box, Pagination } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import UserClient from './UserClient';

type UserTableProps = {
  search?: string;
  size?: number;
  refresh?: boolean;
  onRowClick?: (user: any) => void;
  onChangePage?: (page: number) => void;
};
export function UserTable({
  search,
  size,
  refresh,
  onRowClick,
  onChangePage,
}: Readonly<UserTableProps>) {
  const pageSize = size || 10;
  const [state, setState] = useState({
    page: 0,
    count: 0,
    list: [],
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    UserClient.findAllUsers(search || '', state.page, pageSize).then((res) => {
      setState({ ...state, ...res });
    });
  }, [refresh, search, pageSize, state.page]);

  const handleChangePage = (page: number) => {
    setState({ ...state, page });
    onChangePage?.(page);
  };

  const handleRowClick = (user) => () => {
    onRowClick?.(user);
  };

  const pageCount = Math.ceil(state.count / pageSize);

  return (
    <Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Authorities</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.list.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 4, color: 'text.secondary' }}
                >
                  No users
                </TableCell>
              </TableRow>
            ) : (
              state.list.map((it) => (
                <TableRow
                  key={it.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={handleRowClick(it)}
                >
                  <TableCell component="th" scope="row">
                    {it.name}
                  </TableCell>
                  <TableCell>{it.email}</TableCell>
                  <TableCell>{it.authorities.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pageCount > 1 && (
        <Pagination
          sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}
          count={pageCount}
          page={state.page + 1}
          onChange={(_event, value) => handleChangePage(value - 1)}
          color="primary"
          shape="rounded"
        />
      )}
    </Box>
  );
}
