import ProjectIcon from '@mui/icons-material/AccountTree';
import { Dialog, DialogActions } from '@mui/material';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import { AssignmentClient } from '../../clients/AssignmentClient';
import { type Project, ProjectClient } from '../../clients/ProjectClient';
import { TransitionSlider } from '../../components/transitions/Slide';
import ProjectForm, { PROJECT_FORM_ID } from './ProjectForm';

type ProjectDialogProps = {
  open: boolean;
  closeDialog: () => void;
  project?: Project;
};

export default function ProjectDialog({
  open,
  closeDialog,
  project,
}: ProjectDialogProps) {
  const [disableDelete, setDisableDelete] = useState(true);
  const [disableDeleteReason, setDisableDeleteReason] = useState('');

  const handleSubmit = (project: Project) => {
    const persistPromise = project.code
      ? ProjectClient.put(project.code, project)
      : ProjectClient.post(project);

    persistPromise.then(closeDialog);
  };

  const handleDelete = () => {
    if (project != null) {
      ProjectClient.delete(project.code).then((_res) => closeDialog());
    }
  };

  useEffect(() => {
    if (!project) {
      setDisableDelete(true);
      setDisableDeleteReason('');
      return;
    }

    AssignmentClient.findAllByProject(project).then((res) => {
      const hasAssignments = !!res && res.length > 0;
      setDisableDelete(hasAssignments);
      setDisableDeleteReason(
        hasAssignments
          ? 'This project cannot be deleted because it contains assignments'
          : '',
      );
    });
  }, [project]);

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      TransitionComponent={TransitionSlider}
      maxWidth="md"
    >
      <DialogHeader
        headline="Create a project"
        icon={<ProjectIcon />}
        onClose={closeDialog}
      />
      <DialogBody>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body1">
              Fill out the details of a (Flock.) project
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ProjectForm projectCode={project?.code} onSubmit={handleSubmit} />
          </Grid>
        </Grid>
      </DialogBody>
      <DialogActions>
        {disableDelete && (
          <Typography variant="caption">{disableDeleteReason}</Typography>
        )}
      </DialogActions>
      <DialogFooter
        formId={PROJECT_FORM_ID}
        // onSubmit is handled by the ProjectForm
        onClose={closeDialog}
        onDelete={handleDelete}
        disableDelete={disableDelete}
      />
    </Dialog>
  );
}
