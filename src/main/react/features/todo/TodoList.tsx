import React, { useEffect, useState } from "react";
import { Box, Card, Link, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import CardHeader from "@material-ui/core/CardHeader";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { useHistory } from "react-router-dom";
import { TodoClient } from "../../clients/TodoClient";

// Components
import { StatusMenu } from "../../components/StatusMenu";
import { SimpleTabs } from "../../components/tabs/Tabs";
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Utils
import { groupByType } from "../../utils/groupByType";

// Types
import type { DayProps, DayListProps } from "../../types";

// @todo make this a global PAGE_SIZE constants
const TODO_PAGE_SIZE = 5;

const typeToPath = (type) => {
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
  onItemClick: (status: string, item: any) => void;
  refresh: boolean;
};

export type TodoItemProps = {
  id: string;
  type: string;
  personId: string;
  personName: string;
  description: string;
};

export function TodoList({ onItemClick, refresh }: TodoListProps) {
  const history = useHistory();

  const [list, setList] = useState<any>();
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);

  useEffect(() => {
    TodoClient.all().then((res) => {
      const todoItems = res.body as TodoItemProps[];
      setList(groupByType(todoItems));
      setPageCount(Math.ceil(res.body.length / TODO_PAGE_SIZE));
    });
  }, [refresh]);

  const handleStatusChange = (item: TodoItemProps) => (status) => {
    onItemClick(status, item);
  };

  const handleCardClick = (item: TodoItemProps) => () => {
    history.push(`/${typeToPath(item.type)}?personId=${item.personId}`);
  };

  function renderItem(item: TodoItemProps, key: Number) {
    return (
      <Grid item xs={12} key={`todo-list-item-${key}`}>
        <Card>
          <CardHeader
            title={
              <Link onClick={handleCardClick(item)} color="textPrimary">
                {item.personName}
              </Link>
            }
            subheader={`${item.type}: ${item.description}`}
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
      <SimpleTabs data={list} renderFunction={renderItem} />;
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          totalPages={pageCount}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
