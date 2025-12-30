import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import React, { useEffect, useState } from "react";
import DialogContent from "@mui/material/DialogContent";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter } from "../../components/dialog";
import { AssignmentClient } from "../../clients/AssignmentClient";
import Typography from "@mui/material/Typography";
import ProjectForm, { PROJECT_FORM_ID } from "./ProjectForm";
import { Project, ProjectClient } from "../../clients/ProjectClient";

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
    <Dialog fullScreen open={open} TransitionComponent={TransitionSlider}>
      <DialogTitle>Project form</DialogTitle>
      <DialogContent>
        <ProjectForm projectCode={project?.code} onSubmit={handleSubmit} />
      </DialogContent>
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
