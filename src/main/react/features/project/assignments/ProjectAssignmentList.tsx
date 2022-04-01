import React, {useEffect, useState} from "react";
import ProjectAssignmentListItem from "./ProjectAssignmentListItem";
import {AssignmentClient} from "../../../clients/AssignmentClient";
import {Box} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

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
    <Box>
      {assignments.map(renderAssignment)}
    </Box>
  )
}
