import React, { useEffect, useState } from "react";
import { Box, Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import CardHeader from "@material-ui/core/CardHeader";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import { StatusMenu } from "../../components/StatusMenu";
import { EXPENSE_PAGE_SIZE, ExpenseClient } from "../../clients/ExpenseClient";
import { makeStyles } from "@material-ui/core/styles";
import { Dayjs } from "dayjs";

// Components
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Types
import type { DayListProps } from "../../types";

type ExpenseProps = {
  id: string;
  date: Dayjs;
  description: string;
  person: {
    id: number;
    uuid: string;
    firstname: string;
    lastname: string;
    email: string;
    position: string;
    number: number | null;
    birthdate: string | null;
    joinDate: string | null;
    active: boolean;
    lastActiveAt: string | null;
    reminders: boolean;
    user: string;
    fullName: string;
  };
  status: string;
  amount: number;
  files: any[]; // You can replace 'any' with the specific type of the file object
  type: string;
};

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

export function ExpenseList({ personId, refresh, onClickRow }: DayListProps) {
  const [items, setItems] = useState<ExpenseProps[]>([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  const loadState = () => {
    setLoading(true);

    ExpenseClient.findAllByPersonId(personId, page).then((res) => {
      setPageCount(Math.ceil(res.count / EXPENSE_PAGE_SIZE));
      setItems(res.list);
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

  const handleClickRow = (item) => {
    return () => {
      if (onClickRow) onClickRow(item);
    };
  };

  const handleStatusChange = (item) => (status) => {
    ExpenseClient.put(item.id, item.type.toLowerCase(), {
      ...item,
      personId,
      status,
    }).then(() => loadState());
  };

  function renderItem(item, key) {
    const totalAmount: number =
      "amount" in item ? item.amount : item.distance * item.allowance;

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
                  key={file.file}
                  button
                  component="a"
                  target="_blank"
                  href={`/api/expenses/files/${file.file}/${file.name}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
          </List>
        </Card>
      </Grid>
    );
  }

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
          totalPages={pageCount}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
