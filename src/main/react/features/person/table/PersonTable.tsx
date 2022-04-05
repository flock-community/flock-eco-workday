import React, {useEffect, useState} from "react";
import {Link as RouterLink, useRouteMatch} from "react-router-dom";
import {Link, Paper, Table, TableBody, TableCell, TablePagination, TableRow,} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {PersonTableHead} from "./PersonTableHead";
import {Person, PersonClient} from "../../../clients/PersonClient";
import {AddActionFab} from "../../../components/FabButtons";
import {PersonDialog} from "../PersonDialog";
import {CheckBox} from "@material-ui/icons";

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
  const [count, setCount] = useState(10);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [dialog, setDialog] = useState({ open: false });
  const [reload, setReload] = useState(false);
  const classes = useStyles();

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    PersonClient.findAllByPage({ page, size, sort: "lastname" }).then(
      (res) => {
        setPersonList(res.list);
        setCount(res.total);
      }
    );
  }, [reload, page, size]);

  const handleDialogOpen = () => {
    setDialog({ open: true });
  };

  const handleDialogClose = () => {
    setReload(!reload);
    setDialog({ open: false });
  };

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const rowsPerPage = event.target.value;
    setSize(+rowsPerPage);
    setPage(0);
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
                  <TableRow key={idx} hover>
                    <TableCell
                      className={classes.tblName}
                      component="th"
                      scope="row"
                    >
                      <Link
                        component={RouterLink}
                        to={`${url}/code/${person.uuid}`}
                        underline="none"
                      >
                        {person.firstname} {person.lastname}
                      </Link>
                    </TableCell>
                    <TableCell className={classes.tblEmail} align="left">
                      {person.email}
                    </TableCell>
                    <TableCell align="left">
                      {person.active && <CheckBox />}
                    </TableCell>
                    <TableCell align="left">{person.holidays}</TableCell>
                    <TableCell align="left">{person.clients}</TableCell>
                    <TableCell align="left">{person.hours}</TableCell>
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
          labelDisplayedRows={() => {}}
          rowsPerPage={size}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} />
      <AddActionFab color="primary" onClick={handleDialogOpen} />
    </div>
  );
};
