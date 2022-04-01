import {Container, Grid} from "@material-ui/core";
import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import ProjectList from "./ProjectList";
import ProjectDialog from "./ProjectDialog";
import {AddActionFab} from "../../components/FabButtons";

const useStyles = makeStyles({
  root: {
    marginTop: 100,
  },
});

export function ProjectFeature() {
  const classes = useStyles()
  const [dialog, setDialog] = useState({ open: false, project: undefined })
  const [refresh, setRefresh] = useState(false)

  const openEditDialog = project => setDialog({ open: true, project: project })

  const closeDialog = () => {
    setDialog({ open: false, project: undefined })
    setRefresh(!refresh)
  }

  const newProject = () => {
    setDialog({ open: true, project: undefined })
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ProjectList editProject={openEditDialog} refresh={refresh} />
          <ProjectDialog
            open={dialog.open}
            project={dialog.project}
            closeDialog={closeDialog}
          />
          <AddActionFab color="primary" onClick={newProject} />
        </Grid>
      </Grid>
    </Container>
  )
}
