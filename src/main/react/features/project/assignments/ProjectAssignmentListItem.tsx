import Typography from "@material-ui/core/Typography";
import React from "react";
import {Card} from "@material-ui/core";

export default function ProjectAssignmentListItem({ assignment }) {
  return (
    <Card>
      <Typography>
        {assignment.person.fullName} ({assignment.role}) - {assignment.hoursPerWeek} hours per week
      </Typography>
    </Card>
  )
}
