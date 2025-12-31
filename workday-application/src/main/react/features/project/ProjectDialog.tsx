import { Dialog, DialogActions } from "@mui/material";
import React, { useEffect, useState } from "react";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "@workday-core/components/dialog";
import { AssignmentClient } from "../../clients/AssignmentClient";
import Typography from "@mui/material/Typography";
import ProjectForm, { PROJECT_FORM_ID } from "./ProjectForm";
import { Project, ProjectClient } from "../../clients/ProjectClient";
import { DialogBody } from "@workday-core/components/dialog/DialogHeader";
import Grid from "@mui/material/Grid";
import ProjectIcon from "@mui/icons-material/AccountTree";

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
  const [disableDeleteReason, setDisableDeleteReason] = useState("");

  const handleSubmit = (project: Project) => {
    const persistPromise = project.code
      ? ProjectClient.put(project.code, project)
      : ProjectClient.post(project);

    persistPromise.then(closeDialog);
  };

  const handleDelete = () => {
    if (project != null) {
      ProjectClient.delete(project.code).then((res) => closeDialog());
    }
  };

  useEffect(() => {
    if (!project) {
      setDisableDelete(true);
      setDisableDeleteReason("");
      return;
    }

    AssignmentClient.findAllByProject(project).then((res) => {
      const hasAssignments = !!res && res.length > 0;
      setDisableDelete(hasAssignments);
      setDisableDeleteReason(
        hasAssignments
          ? "This project cannot be deleted because it contains assignments"
          : ""
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
