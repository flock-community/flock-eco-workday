import React, { useEffect, useState } from "react";
import { Box, Card, Link, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import CardHeader from "@material-ui/core/CardHeader";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { useHistory } from "react-router-dom";
import { TodoClient } from "../../clients/TodoClient";

// Components
import { StatusMenu } from "../../components/status/StatusMenu";
import { SimpleTabs } from "../../components/tabs/Tabs";
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Utils
import { groupByType } from "../../utils/groupByType";
import { getPaginatedTabs } from "../../utils/paginationHelpers";

// Types
import { GroupedTodos, StatusProps, TypeProp } from "../../types";
import { Todo } from "../../wirespec/Models";

// @todo make this a global PAGE_SIZE constants
const TODO_PAGE_SIZE = 5;

const typeToPath = (type: TypeProp) => {
  switch (type) {
    case "WORKDAY":
      return "workdays";
    case "SICKDAY":
      return "sickdays";
    case "PLUSDAY":
      return "holidays";
    case "HOLIDAY":
      return "holidays";
    case "EXPENSE":
      return "expenses";
    default:
      return null;
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
      getPaginatedTabs(list as GroupedTodos[], value, TODO_PAGE_SIZE)
    );
  };

  useEffect(() => {
    TodoClient.all().then((res) => {
      const groupedTodos = groupByType(res);
      setList(groupedTodos);
    });
  }, [refresh]);

  useEffect(() => {
    if (!list) return;
    setCount(list[selectedTab].todos.length);
    setPaginatedItems(getPaginatedTabs(list, page, TODO_PAGE_SIZE));
  }, [list, page]);

  useEffect(() => {
    setPage(0);
  }, [selectedTab]);

  const handleStatusChange = (item: Todo) => (status: StatusProps) => {
    onItemClick(status, item);
  };

  const handleCardClick = (item: Todo) => () => {
    history.push(`/${typeToPath(item.todoType)}?personId=${item.personId}`);
  };

  function renderItem(item: Todo, key: Number) {
    return (
      <Grid item xs={12} key={`todo-list-item-${key}`}>
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
