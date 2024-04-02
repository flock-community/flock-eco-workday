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
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      SickDayClient.findAllByPersonId(personId, page).then(
        ({ list, count }: { list: DayProps[]; count: number }) => {
          setList(list);
          setCount(count);
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
          numberOfItems={count}
          itemsPerPage={SICKDAY_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
