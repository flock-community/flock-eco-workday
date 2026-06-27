import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import { useEffect, useState } from 'react';
import {
  ASSIGNMENT_PAGE_SIZE,
  AssignmentClient,
} from '../../clients/AssignmentClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { isDefined } from '../../utils/validation';

type AssignmentListProps = {
  refresh: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
  disableEdit: boolean;
};

export function AssignmentList({
  refresh,
  personId,
  onItemClick,
  disableEdit,
}: Readonly<AssignmentListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const isAdmin = Boolean(
    UserAuthorityUtil.hasAuthority('AssignmentAuthority.ADMIN'),
  );
  const columnCount = isAdmin ? 7 : 6;

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      AssignmentClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setCount(res.count);
        setLoading(false);
      });
    } else {
      setItems([]);
    }
  }, [refresh, personId, page]);

  const handleClickItem = (it) => () => {
    if (!disableEdit && isDefined(onItemClick)) onItemClick(it);
  };

  return (
    <Box>
      <TableCard loading={loading}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                {isAdmin && <TableCell align="right">Hourly rate</TableCell>}
                <TableCell align="right">Hours/week</TableCell>
                <TableCell>Project</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columnCount}
                    align="center"
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    No assignments
                  </TableCell>
                </TableRow>
              ) : (
                items.map((assignment) => (
                  <TableRow
                    key={`assignment-${assignment.code}`}
                    hover={!disableEdit}
                    sx={{ cursor: disableEdit ? 'default' : 'pointer' }}
                    onClick={handleClickItem(assignment)}
                  >
                    <TableCell>{assignment.client.name}</TableCell>
                    <TableCell>{assignment.role}</TableCell>
                    <TableCell>
                      {assignment.from.format('DD-MM-YYYY')}
                    </TableCell>
                    <TableCell>
                      {assignment.to ? (
                        assignment.to.format('DD-MM-YYYY')
                      ) : (
                        <em>now</em>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        {assignment.hourlyRate}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      {assignment.hoursPerWeek}
                    </TableCell>
                    <TableCell>{assignment.project?.name ?? '-'}</TableCell>
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
          itemsPerPage={ASSIGNMENT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Box>
  );
}
