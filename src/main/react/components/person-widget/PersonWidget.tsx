import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CreateIcon from "@material-ui/icons/Create";
import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";

type PersonWidgetProps = {
  person: any;
  handleEditDialog: any;
  handleDelDialog: any;
};
export function PersonWidget({
  person,
  handleEditDialog,
  handleDelDialog,
}: PersonWidgetProps) {
  return (
    <Card>
      <CardHeader
        title={person.fullName}
        action={
          <>
            <IconButton onClick={handleEditDialog}>
              <CreateIcon />
            </IconButton>
            <IconButton onClick={handleDelDialog}>
              <DeleteRoundedIcon />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th">First name</TableCell>
                <TableCell>{person.firstname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Last name</TableCell>
                <TableCell>{person.lastname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Email address</TableCell>
                <TableCell>{person.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Active</TableCell>
                <TableCell>{person.active ? "Yes" : "No"}</TableCell>
              </TableRow>
              {person.active ? null : (
                <TableRow>
                  <TableCell component="th">Last active at</TableCell>
                  <TableCell>{person.lastActiveAt.toLocaleString()}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
