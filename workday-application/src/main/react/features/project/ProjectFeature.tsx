import { Box, Card, CardContent, CardHeader } from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { useState } from "react";
import ProjectList from "./ProjectList";
import ProjectDialog from "./ProjectDialog";
import { Project } from "../../clients/ProjectClient";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";

const PREFIX = 'ProjectFeature';

const classes = {
  root: `${PREFIX}-root`
};

const StyledBox = styled(Box)({
  [`& .${classes.root}`]: {
    marginTop: 100,
  },
});

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
    <StyledBox
      className={"flow"}
      flow-gap={"wide"}
      style={{ paddingBottom: "1.5rem" }}
    >
      <Card>
        <CardHeader
          title="Projects"
          action={
            <Button onClick={newProject}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <ProjectList editProject={openEditDialog} refresh={refresh} />
        </CardContent>
      </Card>
      <ProjectDialog
        open={dialog.open}
        project={dialog.project}
        closeDialog={closeDialog}
      />
    </StyledBox>
  );
}
