import React, { useEffect, useState } from "react";
import ProjectAssignmentListItem from "./ProjectAssignmentListItem";
import {
  Assignment,
  AssignmentClient,
} from "../../../clients/AssignmentClient";
import { TableBody, TableCell, TableHead } from "@mui/material";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";

export default function ProjectAssignmentList({ project }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    AssignmentClient.findAllByProject(project).then((res) =>
      setAssignments(res ? res : [])
    );
  }, []);

  function renderAssignment(assignment) {
    return (
      <ProjectAssignmentListItem
        key={assignment.code}
        assignment={assignment}
      />
    );
  }

  if (assignments.length == 0) {
    return <Typography>No assignments for this project</Typography>;
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Hours / week</TableCell>
          <TableCell>Hourly rate</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Total hours</TableCell>
          <TableCell>Total costs</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{assignments.map(renderAssignment)}</TableBody>
    </Table>
  );
}
