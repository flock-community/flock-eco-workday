import React, {useEffect, useState} from "react";
import {Box, Card, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import CardHeader from "@material-ui/core/CardHeader";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import {StatusMenu} from "../../components/StatusMenu";
import {EXPENSE_PAGE_SIZE, ExpenseClient} from "../../clients/ExpenseClient";
import {Pagination} from "@material-ui/lab";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1
  }),
  pagination: {
    "& .MuiPagination-ul": {
      justifyContent: "right"
    },
  },
})

type ExpenseListProps = {
  refresh: boolean;
  personId?: string;
  onClickRow: (item: any) => void;
};

export function ExpenseList({
  personId,
  refresh,
  onClickRow,
}: ExpenseListProps) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(-1)
  const [loading, setLoading] = useState(true)

  const classes = useStyles(loading)

  const handleChangePage = (event: object, paginationComponentPage: number) =>
    // Client page is 0-based, pagination component is 1-based
    setPage(paginationComponentPage - 1)

  const loadState = () => {
    setLoading(true)

    ExpenseClient.findAllByPersonId(personId, page).then((res) => {
      setPageCount(Math.ceil(res.count / EXPENSE_PAGE_SIZE))
      setItems(res.list)
      setLoading(false)
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
            subheader={`Date: ${item.date.format("DD-MM-YYYY")}`}
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
        { items.map(renderItem) }
      </Grid>
      <Box mt={2}>
        <Pagination
          className={classes.pagination}
          count={pageCount}
          // Client page is 0-based, pagination component is 1-based
          page={page + 1}
          onChange={handleChangePage}
          shape="rounded"
          size="small"
        />
      </Box>
    </>
  );
}
