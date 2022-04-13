import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { PersonTableHead } from "./PersonTableHead";
import { Person, PersonClient } from "../../../clients/PersonClient";
import { AddActionFab } from "../../../components/FabButtons";
import { PersonDialog } from "../PersonDialog";
import { CheckBox } from "@material-ui/icons";

const useStyles = makeStyles({
  root: {
    maxWidth: 1200, // should represent a @screen break-point
  },
  tableWrapper: {
    overflow: "auto",
  },
  tblEmail: {
    minWidth: 200,
  },
  tblName: {
    minWidth: 170,
  },
});

export const PersonTable = () => {
  const { url } = useRouteMatch();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [count, setCount] = useState(-1);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [dialog, setDialog] = useState({ open: false });
  const [reload, setReload] = useState(false);
  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    PersonClient.findAllByPage({ page, size, sort: "lastname" }).then((res) => {
      setPersonList(res.list);
      // FIXME: No total count in response
      // setCount(res.total);
    });
  }, [reload, page, size]);

  const handleDialogOpen = () => {
    setDialog({ open: true });
  };

  const handleDialogClose = () => {
    setReload(!reload);
    setDialog({ open: false });
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const rowsPerPage = event.target.value;
    setSize(+rowsPerPage);
    setPage(0);
  };

  const handleClick = (person: Person) => {
    history.push(`${url}/code/${person.uuid}`);
  };

  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table>
            <PersonTableHead></PersonTableHead>
            <TableBody>
              {personList.map((person, idx) => {
                return (
                  <TableRow key={idx} hover onClick={() => handleClick(person)}>
                    <TableCell
                      className={classes.tblName}
                      component="th"
                      scope="row"
                    >
                      {person.fullName}
                    </TableCell>
                    <TableCell className={classes.tblEmail} align="left">
                      {person.email}
                    </TableCell>
                    <TableCell align="left">
                      {person.active && <CheckBox />}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={count}
          // remove labelDisplayRows by replacing it with an empty return
          labelDisplayedRows={() => null}
          rowsPerPage={size}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} />
      <AddActionFab color="primary" onClick={handleDialogOpen} />
    </div>
  );
};
