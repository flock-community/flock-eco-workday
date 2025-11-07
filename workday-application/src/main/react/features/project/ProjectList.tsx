import React, { useEffect, useState } from "react";
import ProjectListItem from "./ProjectListItem";
import { Project, ProjectClient } from "../../clients/ProjectClient";
import {
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";

export default function ProjectList({ editProject, refresh }) {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // @ts-ignore
    ProjectClient.all().then((res) => setProjects(res));
  }, [refresh]);

  function renderItem(item: Project, key: number) {
    return (
      <ProjectListItem key={key} project={item} editProject={editProject} />
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Project name</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{projects.map(renderItem)}</TableBody>
      </Table>
    </TableContainer>
  );
}
