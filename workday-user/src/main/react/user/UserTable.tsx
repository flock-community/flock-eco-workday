import React, { useEffect, useState } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableFooter from "@mui/material/TableFooter";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import UserClient from "./UserClient";

type UserTableProps = {
  search?: string;
  size?: number;
  reload?: boolean;
  onRowClick?: (user: any) => void;
  onChangePage?: (page: number) => void;
};
export function UserTable({
  search,
  size,
  reload,
  onRowClick,
  onChangePage,
}: UserTableProps) {
  const [state, setState] = useState({
    page: 0,
    count: 0,
    list: [],
  });

  useEffect(() => {
    UserClient.findAllUsers(search || "", state.page, size || 10).then(
      (res) => {
        setState({ ...state, ...res });
      }
    );
  }, [reload, search, size, state.page]);

  const handleChangePage = (event, page) => {
    setState({ ...state, page });
    onChangePage?.(page);
  };

  const handleRowClick = (user) => () => {
    onRowClick?.(user);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Authorities</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {state.list.map((it) => (
          <TableRow key={it.id} hover onClick={handleRowClick(it)}>
            <TableCell component="th" scope="row">
              {it.name}
            </TableCell>
            <TableCell>{it.email}</TableCell>
            <TableCell>{it.authorities.length}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            count={state.count}
            rowsPerPage={size || 10}
            page={state.page}
            rowsPerPageOptions={[]}
            onPageChange={handleChangePage}
          />
        </TableRow>
      </TableFooter>
    </Table>
  );
}
