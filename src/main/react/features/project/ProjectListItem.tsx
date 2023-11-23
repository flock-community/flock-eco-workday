import React, { useState } from "react";
import { TableCell } from "@material-ui/core";
import TableRow from "@material-ui/core/TableRow";
import CreateIcon from "@material-ui/icons/Create";
import IconButton from "@material-ui/core/IconButton";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@material-ui/icons";
import ProjectAssignmentList from "./assignments/ProjectAssignmentList";

export default function ProjectListItem({ project, editProject }) {
  const [showAssignments, setShowAssignments] = useState(false);

  const toggleShowAssignments = () => setShowAssignments(!showAssignments);

  const handleEdit = () => editProject(project);

  const projectHeader = (
    <TableRow>
      <TableCell width={'50px'}>
        <IconButton onClick={toggleShowAssignments}>
          {showAssignments ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </IconButton>
      </TableCell>
      <TableCell>{project.name}</TableCell>
      <TableCell align="right" width={'50px'}>
        <IconButton onClick={handleEdit}>
          <CreateIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const projectAssignments = (
    <TableRow>
      <TableCell colSpan={3}>
        <ProjectAssignmentList project={project} />
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {projectHeader}
      {showAssignments && projectAssignments}
    </>
  );
}
