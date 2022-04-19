import React, { useEffect, useState } from "react";
import { Box, Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { SICKDAY_PAGE_SIZE, SickDayClient } from "../../clients/SickDayClient";
import { DayListItem } from "../../components/DayListItem";
import { makeStyles } from "@material-ui/core/styles";
import { Pagination } from "@material-ui/lab";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
  pagination: {
    "& .MuiPagination-ul": {
      justifyContent: "right",
    },
  },
});

type SickDayListProps = {
  refresh: boolean;
  personId?: string;
  onClickRow: (item: any) => void;
  onClickStatus: (status: string, item: any) => void;
};

export function SickDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: SickDayListProps) {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  const handleChangePage = (event: object, paginationComponentPage: number) =>
    // Client page is 0-based, pagination component is 1-based
    setPage(paginationComponentPage - 1);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      SickDayClient.findAllByPersonId(personId, page).then((res) => {
        setList(res.list);
        setPageCount(Math.ceil(res.count / SICKDAY_PAGE_SIZE));
        setLoading(false);
      });
    } else {
      setList([]);
    }
  }, [personId, refresh, page]);

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`sickday-list-item-${key}`}>
        <DayListItem
          value={item}
          onClick={() => onClickRow(item)}
          onClickStatus={(status) => onClickStatus(status, item)}
          hasAuthority={"SickdayAuthority.ADMIN"}
        />
      </Grid>
    );
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No sick days</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Grid container spacing={1} className={classes.list}>
        {list.map(renderItem)}
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
