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
import { InputItemProps, GroupedItemProps } from "../../types";

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

export function TodoList({ onItemClick, refresh }: TodoListProps) {
  const history = useHistory();

  const [list, setList] = useState<GroupedItemProps[]>();
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const handlePageChange = (value) => {
    setPage(value);
    paginateItemsByTabAndPage(value);
  };

  useEffect(() => {
    TodoClient.all().then((res) => {
      const todoItems = res.body as InputItemProps[];
      const groupedTodoItems = groupByType(todoItems);
      setList(groupedTodoItems);

      setPageCount(
        Math.ceil(
          groupByType(todoItems)[selectedTab].items.length / TODO_PAGE_SIZE
        )
      );
    });
  }, [refresh]);

  const getItemsPerPage = (item, page) => {
    return item.items.slice(
      page * TODO_PAGE_SIZE,
      page * TODO_PAGE_SIZE + TODO_PAGE_SIZE
    );
  };

  const getPaginatedTabs = (data, page) => {
    return data.map((item) => {
      return {
        type: item.type,
        items: getItemsPerPage(item, page),
      };
    });
  };

  const paginateItemsByTabAndPage = (page) => {
    setPaginatedItems(getPaginatedTabs(list, page));
  };

  useEffect(() => {
    if (!list) return;
    setPageCount(Math.ceil(list[selectedTab].items.length / TODO_PAGE_SIZE));
    paginateItemsByTabAndPage(0);
    setPage(0);
  }, [selectedTab]);

  useEffect(() => {
    if (!list) return;
    paginateItemsByTabAndPage(page);
  }, [list]);

  const handleStatusChange = (item: InputItemProps) => (status) => {
    onItemClick(status, item);
  };

  const handleCardClick = (item: InputItemProps) => () => {
    history.push(`/${typeToPath(item.type)}?personId=${item.personId}`);
  };

  function renderItem(item: InputItemProps, key: Number) {
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
      <Typography component="h1" variant="h5">
        Todo's
      </Typography>
      <SimpleTabs
        data={paginatedItems}
        renderFunction={renderItem}
        exposedValue={setSelectedTab}
      />
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          totalPages={pageCount}
          changePageCb={handlePageChange}
        />
      </Box>
    </>
  );
}
