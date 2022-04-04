import React, {useEffect, useState} from "react";
import ProjectAssignmentListItem from "./ProjectAssignmentListItem";
import {AssignmentClient} from "../../../clients/AssignmentClient";
import {TableBody, TableCell, TableHead} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";

export default function ProjectAssignmentList({ project }) {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    AssignmentClient.findAllByProject(project).then(res => setAssignments(res))
  }, [])

  function renderAssignment(assignment) {
    return (
      <ProjectAssignmentListItem key={assignment.code} assignment={assignment}/>
    )
  }

  if (assignments.length == 0) {
    return (
      <Typography>
        No assignments for this project
      </Typography>
    )
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
        </TableRow>
      </TableHead>
      <TableBody>
        {assignments.map(renderAssignment)}
      </TableBody>
    </Table>
  )
}
