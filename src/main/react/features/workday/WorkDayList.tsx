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
import { Pagination } from "@material-ui/lab";

type WorkDayListProps = {
  personId: string;
  refresh: boolean;
  onClickRow: (item: any) => void;
  onClickStatus: (status: any, item: any) => void;
};

const useStyles = makeStyles({
  card: (loading) => ({
    marginTop: "10px",
    opacity: loading ? 0.5 : 1,
  }),
  pagination: {
    "& .MuiPagination-ul": {
      justifyContent: "right",
    },
  },
});

export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: WorkDayListProps) {
  const [state, setState] = useState([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  const handleChangePage = (event: object, paginationComponentPage: number) =>
    // Client page is 0-based, pagination component is 1-based
    setPage(paginationComponentPage - 1);

  useEffect(() => {
    setLoading(true);
    WorkDayClient.findAllByPersonUuid(personId, page).then((res) => {
      setPageCount(Math.ceil(res.count / WORK_DAY_PAGE_SIZE));
      setState(res.list);
      setLoading(false);
    });
  }, [personId, refresh, page]);

  function renderItem(item, key) {
    return (
      <WorkDayListItem
        key={key}
        value={item}
        onClick={() => onClickRow(item)}
        onClickStatus={(status) => onClickStatus(status, item)}
        hasAuthority={"WorkDayAuthority.ADMIN"}
      />
    );
  }

  const renderItems = () => {
    if (state.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8}>No workdays</TableCell>
        </TableRow>
      );
    }

    return state.map(renderItem);
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
        <Pagination
          count={pageCount}
          className={classes.pagination}
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
