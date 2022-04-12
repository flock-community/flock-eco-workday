import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import { Feed } from "../../features/person/widgets/Feed";

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
      <Feed
        title="User Information"
        onEdit={handleEditDialog}
        onDelete={handleDelDialog}
      />
      <CardHeader
        avatar={<Avatar aria-label="recipe">WF</Avatar>}
        title={`${person.firstname} ${person.lastname}`}
        subheader={person.email}
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
