import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { DataTable } from '@workday-core/components/DataTable';
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
        <DataTable
          columns={[{}, { header: 'Project name' }, {}]}
          items={projects}
          renderRow={renderItem}
          emptyMessage="No projects"
          aria-label="collapsible table"
        />
      </TableCard>
    </Box>
  );
}
