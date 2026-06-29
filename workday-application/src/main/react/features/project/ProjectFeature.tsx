import { Box } from '@mui/material';
import { useState } from 'react';
import type { Project } from '../../clients/ProjectClient';
import ProjectDialog from './ProjectDialog';
import ProjectList from './ProjectList';

type DialogState = {
  open: boolean;
  project?: Project;
};

export function ProjectFeature() {
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    project: undefined,
  });
  const [refresh, setRefresh] = useState(false);

  const openEditDialog = (project: Project) =>
    setDialog({ open: true, project: project });

  const closeDialog = () => {
    setDialog({ open: false, project: undefined });
    setRefresh(!refresh);
  };

  const newProject = () => {
    setDialog({ open: true, project: undefined });
  };

  return (
    <Box
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <ProjectList
        editProject={openEditDialog}
        refresh={refresh}
        onClickAdd={newProject}
      />
      <ProjectDialog
        open={dialog.open}
        project={dialog.project}
        closeDialog={closeDialog}
      />
    </Box>
  );
}
