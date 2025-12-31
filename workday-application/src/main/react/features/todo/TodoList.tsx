import { Box, Card, Link, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { TodoClient } from '../../clients/TodoClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
// Components
import { StatusMenu } from '../../components/status/StatusMenu';
import { SimpleTabs } from '../../components/tabs/Tabs';
// Types
import type { GroupedTodos, StatusProps, TypeProp } from '../../types';
// Utils
import { groupByType } from '../../utils/groupByType';
import { getPaginatedTabs } from '../../utils/paginationHelpers';
import type { Todo, TodoType } from '../../wirespec/Models';

// @todo make this a global PAGE_SIZE constants
const TODO_PAGE_SIZE = 5;

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
  onItemClick: (status: StatusProps, item: Todo) => void;
  refresh: boolean;
};

export function TodoList({ onItemClick, refresh }: TodoListProps) {
  const history = useHistory();

  const [list, setList] = useState<GroupedTodos[]>();
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [paginatedItems, setPaginatedItems] = useState<GroupedTodos[]>([]);

  const handlePageChange = (value: number) => {
    setPage(value);
    setPaginatedItems(
      getPaginatedTabs(list as GroupedTodos[], value, TODO_PAGE_SIZE),
    );
  };

  useEffect(() => {
    TodoClient.all().then((res) => {
      const groupedTodos = groupByType(res);
      setList(groupedTodos);
    });
  }, []);

  useEffect(() => {
    if (!list) return;
    setCount(list[selectedTab].todos.length);
    setPaginatedItems(getPaginatedTabs(list, page, TODO_PAGE_SIZE));
  }, [list, page, selectedTab]);

  useEffect(() => {
    setPage(0);
  }, []);

  const handleStatusChange = (item: Todo) => (status: StatusProps) => {
    onItemClick(status, item);
  };

  const _mapTodoType: Record<TodoType, string> = {
    WORKDAY: '',
    SICKDAY: '',
    HOLIDAY: '',
    PAID_PARENTAL_LEAVE: '',
    UNPAID_PARENTAL_LEAVE: '',
    EXPENSE: '',
    PLUSDAY: '',
    PAID_LEAVE: '',
  };
  const handleCardClick = (item: Todo) => () => {
    history.push(`/${typeToPath(item.todoType)}?personId=${item.personId}`);
  };

  function renderItem(item: Todo, key: number) {
    return (
      <Grid size={{ xs: 12 }} key={`todo-list-item-${key}`}>
        <Card>
          <CardHeader
            title={
              <Link onClick={handleCardClick(item)} color="textPrimary">
                {item.personName}
              </Link>
            }
            subheader={`${item.todoType}: ${item.description}`}
            action={
              <StatusMenu
                onChange={handleStatusChange(item)}
                disabled={false}
                value="REQUESTED"
              />
            }
          />
        </Card>
      </Grid>
    );
  }

  if (!list) {
    return <AlignedLoader />;
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>Nothing todo</Typography>
        </CardContent>
      </Card>
    );
  }
  return (
    <>
      <SimpleTabs
        data={paginatedItems}
        renderFunction={renderItem}
        exposedValue={setSelectedTab}
      />
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={TODO_PAGE_SIZE}
          changePageCb={handlePageChange}
        />
      </Box>
    </>
  );
}
