import React, { useEffect, useState } from "react";
import {
  Card,
  makeStyles,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import { WorkDayClient } from "../../clients/WorkDayClient";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import { WorkDayListItem } from "./WorkDayListItem";

type WorkDayListProps = {
  personId?: string;
  refresh: boolean;
  onClickRow: (item: any) => void;
  onClickStatus: (status: any, item: any) => void;
};

const useStyles = makeStyles({
  card: {
    marginTop: "10px",
  },
});

export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: WorkDayListProps) {
  const [state, setState] = useState([]);

  const classes = useStyles();

  useEffect(() => {
    if (personId) {
      WorkDayClient.findAllByPersonUuid(personId).then((res) => setState(res));
    }
  }, [personId, refresh]);

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

  const renderItems = (items) => {
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
            <TableBody>{renderItems(state)}</TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
