import React, { useEffect, useState } from "react";
import { Box, Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { SICKDAY_PAGE_SIZE, SickDayClient } from "../../clients/SickDayClient";
import { DayListItem } from "../../components/DayListItem";
import { makeStyles } from "@material-ui/core/styles";

// Components
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Types
import type { DayProps, DayListProps } from "../../types";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

export function SickDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      SickDayClient.findAllByPersonId(personId, page).then(
        (res: { list: DayProps[]; count: number }) => {
          setList(res.list);

          setPageCount(Math.ceil(res.count / SICKDAY_PAGE_SIZE));
          setLoading(false);
        }
      );
    } else {
      setList([]);
    }
  }, [personId, refresh, page]);

  function renderItem(item: DayProps, key: number) {
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
        <FlockPagination
          currentPage={page + 1}
          totalPages={pageCount}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
