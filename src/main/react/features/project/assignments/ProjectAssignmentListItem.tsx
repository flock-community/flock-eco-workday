import React from "react";
import {TableCell} from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";

export default function ProjectAssignmentListItem({ assignment }) {
  return (
    <TableRow>
      <TableCell>{assignment.person.fullName}</TableCell>
      <TableCell>{assignment.role}</TableCell>
      <TableCell>{assignment.hoursPerWeek}</TableCell>
      <TableCell>{assignment.hourlyRate}</TableCell>
      <TableCell>{assignment.from.format("DD-MM-YYYY")}</TableCell>
      <TableCell>{assignment.to?.format("DD-MM-YYYY")}</TableCell>
    </TableRow>
  )
}
