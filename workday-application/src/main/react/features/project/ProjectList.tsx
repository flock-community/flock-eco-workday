import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { type Project, ProjectClient } from '../../clients/ProjectClient';
import { TableCard } from '../../components/TableCard';
import ProjectListItem from './ProjectListItem';

export default function ProjectList({ editProject, refresh, onClickAdd }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);
    ProjectClient.all().then((res) => {
      setProjects(res);
      setLoading(false);
    });
  }, [refresh]);

  function renderItem(item: Project, key: number) {
    return (
      <ProjectListItem key={key} project={item} editProject={editProject} />
    );
  }

  return (
    <Box>
      <TableCard
        title="Projects"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <TableContainer>
          <Table size="small" aria-label="collapsible table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Project name</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    No projects
                  </TableCell>
                </TableRow>
              ) : (
                projects.map(renderItem)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
    </Box>
  );
}
