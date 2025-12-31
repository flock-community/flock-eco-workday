import React, { useEffect, useState } from "react";
import Grid2 from "@mui/material/Grid2";
import Card from "@mui/material/Card";
import { Box, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import {
  LEAVE_DAY_PAGE_SIZE,
  LeaveDayClient,
} from "../../clients/LeaveDayClient";
import { DayListItem } from "../../components/DayListItem";
import makeStyles from "@mui/styles/makeStyles";

// Components
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Types
import type { DayListProps, DayProps } from "../../types";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

export function LeaveDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [update] = useState(refresh);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      LeaveDayClient.findAllByPersonId(personId, page).then(
        ({ list, count }: { list: DayProps[]; count: number }) => {
          setList(list);
          setCount(count);
          setLoading(false);
        }
      );
    } else {
      setList([]);
    }
  }, [personId, refresh, update, page]);

  function renderItem(item: DayProps, key: number) {
    return (
      <Grid2 size={{ xs: 12 }} key={`holiday-list-item-${key}`}>
        <DayListItem
          value={item}
          onClick={() => onClickRow(item)}
          onClickStatus={(status) => onClickStatus(status, item)}
          hasAuthority={"LeaveDayAuthority.ADMIN"}
        />
      </Grid2>
    );
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No leave days.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Grid2 container spacing={1} className={classes.list}>
        {list.map(renderItem)}
      </Grid2>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={LEAVE_DAY_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
