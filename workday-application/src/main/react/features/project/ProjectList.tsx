import {
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { type Project, ProjectClient } from '../../clients/ProjectClient';
import ProjectListItem from './ProjectListItem';

export default function ProjectList({ editProject, refresh }) {
  const [projects, setProjects] = useState<Project[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
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
