import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  makeStyles,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import { WORK_DAY_PAGE_SIZE, WorkDayClient } from "../../clients/WorkDayClient";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import { WorkDayListItem } from "./WorkDayListItem";

// Components
import { FlockPagination } from "../../components/pagination/FlockPagination";

// Types
import type { DayProps, DayListProps } from "../../types";

const useStyles = makeStyles({
  card: (loading) => ({
    marginTop: "10px",
    opacity: loading ? 0.5 : 1,
  }),
});

export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  useEffect(() => {
    setLoading(true);
    WorkDayClient.findAllByPersonUuid(personId, page).then(
      (res: { list: DayProps[]; count: number }) => {
        setList(res.list);
        setLoading(false);
      }
    );
  }, [personId, refresh, page]);

  function renderItem(item) {
    return (
      <WorkDayListItem
        key={item.id}
        value={item}
        onClick={() => onClickRow(item)}
        onClickStatus={(status) => onClickStatus(status, item)}
        hasAuthority={"WorkDayAuthority.ADMIN"}
      />
    );
  }

  const renderItems = () => {
    if (list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8}>No workdays</TableCell>
        </TableRow>
      );
    }

    return list.map(renderItem);
  };

  return (
    <>
      <Card className={classes.card}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell align="right">Days</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>{renderItems()}</TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={list.length}
          itemsPerPage={WORK_DAY_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
