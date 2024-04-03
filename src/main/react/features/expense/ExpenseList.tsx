import React, { useEffect, useState } from "react";
import { Box, Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import CardHeader from "@material-ui/core/CardHeader";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import { StatusMenu } from "../../components/status/StatusMenu";
import { EXPENSE_PAGE_SIZE, ExpenseClient } from "../../clients/ExpenseClient";
import { makeStyles } from "@material-ui/core/styles";

// Components
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Types
import type { DayListProps } from "../../types";
import { Status } from "../../models/Status";
import { CostExpense, TravelExpense } from "../../models/Expense";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

export function ExpenseList({ personId, refresh, onClickRow }: DayListProps) {
  const [items, setItems] = useState<(CostExpense | TravelExpense)[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  const loadState = () => {
    setLoading(true);

    ExpenseClient.findAllByPersonId(personId, page).then((res) => {
      setItems(res.list);
      setCount(res.count);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (personId) {
      loadState();
    }
  }, [personId, refresh, page]);

  const isAdmin = () =>
    !UserAuthorityUtil.hasAuthority("ExpenseAuthority.ADMIN");

  const handleClickRow = (item: CostExpense | TravelExpense) => {
    return () => {
      if (onClickRow) onClickRow(item);
    };
  };

  const handleStatusChange =
    (item: CostExpense | TravelExpense) => (status: Status) => {
      ExpenseClient.put(item.id, {
        ...item,
        status,
      }).then(() => loadState());
    };

  const renderItem = (item: CostExpense | TravelExpense, key: number) => {
    const totalAmount: number = item.amount;

    return (
      <Grid key={`workday-list-item-${key}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardHeader
            action={
              <StatusMenu
                onChange={handleStatusChange(item)}
                disabled={isAdmin()}
                value={item.status}
              />
            }
            title={item.description ? item.description : "empty"}
            subheader={
              <Typography>
                Date: {item.date.format("DD-MM-YYYY")} | Total:{" "}
                {totalAmount.toLocaleString("nl-NL", {
                  style: "currency",
                  currency: "EUR",
                })}
              </Typography>
            }
          />
          <List>
            {item.files &&
              item.files.map((file) => (
                <ListItem
                  key={file.fileId}
                  button
                  component="a"
                  target="_blank"
                  href={`/api/expenses/files/${file.fileId}/${file.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
          </List>
        </Card>
      </Grid>
    );
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No expenses</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Grid container spacing={1} className={classes.list}>
        {items.map(renderItem)}
      </Grid>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={EXPENSE_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
