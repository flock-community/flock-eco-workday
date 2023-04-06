import React, { useEffect, useRef, useState } from "react";
import { useRouteMatch, Link } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { PersonTableHead } from "./PersonTableHead";
import { Person, PersonClient } from "../../../clients/PersonClient";
import { PersonDialog } from "../PersonDialog";
import { CheckBox } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme: any) => ({
  tblEmail: {
    minWidth: 200,
  },
  tblName: {
    minWidth: 170,
  },
  tblRow: {
    position: "relative",
  },
  link: {
    color: "black",
    textDecoration: "none",
    ...theme?.props?.link,
  },
}));

export const PersonTable = () => {
  const { url } = useRouteMatch();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [count, setCount] = useState(-1);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [dialog, setDialog] = useState({ open: false });
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const classes = useStyles();

  useEffect(() => searchInputRef?.current?.focus(), [searchInputRef]);

  useEffect(() => {
    PersonClient.findAllByFullName(
      { page, size, sort: "firstname" },
      searchTerm
    ).then((res) => {
      setPersonList(res.list);
      setCount(res.count);
    });
  }, [reload, page, size, searchTerm]);

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

  return (
    <>
      <Card>
        <CardHeader
          title="Persons"
          action={
            <Button onClick={handleDialogOpen}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <Box m={2}>
            <TextField
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name"
              inputRef={searchInputRef}
            />
          </Box>
          <TableContainer>
            <Table>
              <PersonTableHead />
              <TableBody>
                {personList.map((person, idx) => {
                  return (
                    <TableRow key={idx} hover className={classes.tblRow}>
                      <TableCell
                        className={classes.tblName}
                        component="th"
                        scope="row"
                      >
                        <Link
                          key={person.uuid}
                          to={`${url}/code/${person.uuid}`}
                          className={classes.link}
                        >
                          {person.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className={classes.tblEmail} align="left">
                        <Typography className={classes.tblRow}>
                          {person.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {person.active && <CheckBox />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
          </TableContainer>
        </CardContent>
      </Card>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} />
    </>
  );
};
