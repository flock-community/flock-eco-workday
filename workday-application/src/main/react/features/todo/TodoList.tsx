import {
  Box,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TodoClient } from '../../clients/TodoClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { StatusMenu } from '../../components/status/StatusMenu';
import { TableCard } from '../../components/TableCard';
import type { GroupedTodos, StatusProps, TypeProp } from '../../types';
import { groupByType } from '../../utils/groupByType';
import { getPaginatedTabs } from '../../utils/paginationHelpers';
import type { Todo } from '../../wirespec/model';

const TODO_PAGE_SIZE = 15;

const typeToPath = (type: TypeProp) => {
  switch (type) {
    case 'WORKDAY':
      return 'workdays';
    case 'SICKDAY':
      return 'sickdays';
    case 'PLUSDAY':
      return 'leave-days';
    case 'HOLIDAY':
      return 'leave-days';
    case 'PAID_PARENTAL_LEAVE':
      return 'leave-days';
    case 'UNPAID_PARENTAL_LEAVE':
      return 'leave-days';
    case 'PAID_LEAVE':
      return 'leave-days';
    case 'EXPENSE':
      return 'expenses';
    default:
      throw new Error(`Cannot map todo type to path: ${type}`);
  }
};

type TodoListProps = {
  onItemClick: (status: StatusProps, item: Todo) => void | Promise<void>;
  refresh: boolean;
};

export function TodoList({ onItemClick, refresh }: TodoListProps) {
  const history = useHistory();

  const [list, setList] = useState<GroupedTodos[]>();
  const [page, setPage] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, StatusProps>
  >({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    TodoClient.all().then((res) => {
      setList(groupByType(res));
      setStatusOverrides({});
    });
  }, [refresh]);

  const handleTabChange = (_event: unknown, value: number) => {
    setSelectedTab(value);
    setPage(0);
  };

  const handleStatusChange = (item: Todo) => (status: StatusProps) => {
    const id = String(item.id);
    setStatusOverrides((current) => ({ ...current, [id]: status }));
    Promise.resolve(onItemClick(status, item)).catch(() => {
      setStatusOverrides((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    });
  };

  const handleRowClick = (item: Todo) => () => {
    history.push(`/${typeToPath(item.todoType)}?personId=${item.personId}`);
  };

  if (!list) {
    return <AlignedLoader />;
  }

  if (list.length === 0) {
    return (
      <TableCard title="Todo's">
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          Nothing todo
        </Box>
      </TableCard>
    );
  }

  // a refetch can drop the active type's group (last todo approved), shrinking list under selectedTab
  const safeTab = Math.min(selectedTab, list.length - 1);
  const paginated = getPaginatedTabs(list, page, TODO_PAGE_SIZE);
  const currentTodos = paginated[safeTab]?.todos ?? [];
  const count = list[safeTab]?.todos.length ?? 0;

  return (
    <Box>
      <TableCard title="Todo's">
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 1 }}
        >
          {list.map((group) => (
            <Tab
              key={group.todoType}
              label={group.todoType.replaceAll('_', ' ')}
            />
          ))}
        </Tabs>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Person</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTodos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    Nothing todo
                  </TableCell>
                </TableRow>
              ) : (
                currentTodos.map((item) => (
                  <TableRow
                    key={`todo-list-item-${item.id}`}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={handleRowClick(item)}
                  >
                    <TableCell>{item.personName}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell
                      align="right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <StatusMenu
                        onChange={handleStatusChange(item)}
                        disabled={false}
                        value={statusOverrides[String(item.id)] ?? 'REQUESTED'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={TODO_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
