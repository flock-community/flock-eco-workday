import AddIcon from '@mui/icons-material/Add';
import { Box, Button, TableCell, TableRow } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
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
  onClickAdd?: () => void;
};

export function AssignmentList({
  refresh,
  personId,
  onItemClick,
  disableEdit,
  onClickAdd,
}: Readonly<AssignmentListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const isAdmin = Boolean(
    UserAuthorityUtil.hasAuthority('AssignmentAuthority.ADMIN'),
  );

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
      <TableCard
        title="Assignments"
        action={
          disableEdit ? undefined : (
            <Button startIcon={<AddIcon />} onClick={onClickAdd}>
              Add
            </Button>
          )
        }
        loading={loading}
      >
        <DataTable
          columns={[
            { header: 'Client' },
            { header: 'Role' },
            { header: 'From' },
            { header: 'To' },
            ...(isAdmin
              ? [{ header: 'Hourly rate', align: 'right' as const }]
              : []),
            { header: 'Hours/week', align: 'right' },
            { header: 'Project' },
          ]}
          items={items}
          renderRow={(assignment) => (
            <TableRow
              key={`assignment-${assignment.code}`}
              hover={!disableEdit}
              sx={{ cursor: disableEdit ? 'default' : 'pointer' }}
              onClick={handleClickItem(assignment)}
            >
              <TableCell>{assignment.client.name}</TableCell>
              <TableCell>{assignment.role}</TableCell>
              <TableCell>{assignment.from.format('DD-MM-YYYY')}</TableCell>
              <TableCell>
                {assignment.to ? (
                  assignment.to.format('DD-MM-YYYY')
                ) : (
                  <em>now</em>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell align="right">{assignment.hourlyRate}</TableCell>
              )}
              <TableCell align="right">{assignment.hoursPerWeek}</TableCell>
              <TableCell>{assignment.project?.name ?? '-'}</TableCell>
            </TableRow>
          )}
          emptyMessage="No assignments"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={ASSIGNMENT_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
