import React, { useState } from "react";
import { TableCell } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import CreateIcon from "@mui/icons-material/Create";
import IconButton from "@mui/material/IconButton";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import ProjectAssignmentList from "./assignments/ProjectAssignmentList";

export default function ProjectListItem({ project, editProject }) {
  const [showAssignments, setShowAssignments] = useState(false);

  const toggleShowAssignments = () => setShowAssignments(!showAssignments);

  const handleEdit = () => editProject(project);

  const projectHeader = (
    <TableRow>
      <TableCell width={"50px"}>
        <IconButton onClick={toggleShowAssignments} size="large">
          {showAssignments ? (
            <KeyboardArrowUpIcon />
          ) : (
            <KeyboardArrowDownIcon />
          )}
        </IconButton>
      </TableCell>
      <TableCell>{project.name}</TableCell>
      <TableCell align="right" width={"50px"}>
        <IconButton onClick={handleEdit} size="large">
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
