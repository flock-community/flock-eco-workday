import React, {useEffect, useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom"
import {CardHeader, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow} from "@material-ui/core";
import {Assignment, AssignmentClient} from "../../../clients/AssignmentClient";
import dayjs from "dayjs";
import {AssignmentOverviewTableHead} from "./AssignmentOverviewTableHead";
import {DMY_DATE} from "../../../clients/util/DateFormats";

export default function AssignmentOverviewTable() {
  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(-1);
  const [rowCount, setRowCount] = useState(-1);
  const history = useHistory();
  const {url} = useRouteMatch();

  useEffect(() => {
    AssignmentClient.findAllByToAfterOrToNull(dayjs().toDate(), {
      page: page,
      size: size,
      sort: 'person.firstname,from'
    }).then((res) => {
      setAssignmentList(res.list);
      setRowCount(res.count)
    });
  }, [page, size]);

  const handleClick = (assignment: Assignment) => {
    history.push(`${url}/code/${assignment.code}`);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const rowsPerPage = event.target.value;
    setSize(rowsPerPage);
    setPage(0);
  };

  return (
    <>
      <CardHeader title="Assignments"/>
      <TableContainer>
        <Table>
          <AssignmentOverviewTableHead/>
          <TableBody>
            {assignmentList.map((assignment, idx) => {
              return (
                <TableRow key={idx} >
                  <TableCell>
                    {assignment.person.fullName}
                  </TableCell>
                  <TableCell>
                    {assignment.client.name}
                  </TableCell>
                  <TableCell>
                    {assignment.from.format(DMY_DATE)}
                  </TableCell>
                  <TableCell>
                    {assignment.to?.format(DMY_DATE)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, {value: -1, label: 'All'}]}
          component="div"
          count={rowCount}
          rowsPerPage={size}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
    </>
  )
}
